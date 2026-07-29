import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import 'dart:math' as math;
import 'dart:ui';
import 'dart:convert';
import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:open_file/open_file.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../../services/auth_api_service.dart';

class CarteScreen extends StatefulWidget {
  const CarteScreen({super.key});
  @override
  State<CarteScreen> createState() => _CarteScreenState();
}

class _CarteScreenState extends State<CarteScreen> {
  int _selectedDoc = 0;
  bool _isLoading = true;
  List<Map<String, dynamic>> _documents = [];

  @override
  void initState() {
    super.initState();
    _loadDocuments();
  }

  Future<void> _loadDocuments() async {
    final res = await AuthApiService.fetchMyDocuments();
    List<Map<String, dynamic>> list = [];
    if (res.isSuccess && res.data != null) {
      list = res.data!.cast<Map<String, dynamic>>().map((d) {
        // Map DocType to icon and color
        final type = d['type'] as String? ?? 'AUTRE';
        IconData icon = Icons.description_rounded;
        int color = 0xFF64748B;
        if (type == 'BULLETIN_SALAIRE' || type == 'FICHE_PAIE' || type == 'PAYSLIP') { icon = Icons.receipt_long_rounded; color = 0xFF10B981; }
        else if (type == 'ATTESTATION_TRAVAIL' || type == 'WORK_CERTIFICATE') { icon = Icons.work_rounded; color = 0xFF2962FF; }
        else if (type == 'ATTESTATION_SALAIRE' || type == 'SALARY_CERTIFICATE') { icon = Icons.attach_money_rounded; color = 0xFFF59E0B; }
        else if (type == 'CONTRAT' || type == 'CONTRACT') { icon = Icons.gavel_rounded; color = 0xFF7C3AED; }
        else if (type == 'ID_DOCUMENT') { icon = Icons.badge_rounded; color = 0xFF06B6D4; }
        else if (type == 'TAX_DECLARATION') { icon = Icons.account_balance_rounded; color = 0xFFEF4444; }

        // Format date
        final dtIso = d['createdAt'] as String? ?? '';
        String dateStr = '';
        try {
          final dt = DateTime.parse(dtIso);
          dateStr = '${dt.day.toString().padLeft(2,'0')}/${dt.month.toString().padLeft(2,'0')}/${dt.year}';
        } catch (_) { dateStr = 'Récent'; }

        return {
          'id': d['_id'],
          'title': d['title'] ?? 'Document',
          'icon': icon,
          'color': color,
          'date': dateStr,
          'fileUrl': d['fileUrl'],
        };
      }).toList();
    }
    
    if (mounted) {
      setState(() {
        _documents = list;
        _isLoading = false;
      });
    }
  }

  Future<void> _downloadDoc(Map<String, dynamic> doc) async {
    if (doc['fileUrl'] == null || doc['fileUrl'].toString().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Document non disponible')));
      return;
    }
    try {
      showDialog(context: context, barrierDismissible: false, builder: (_) => const Center(child: CircularProgressIndicator()));
      final bytes = base64Decode(doc['fileUrl'].toString().split(',').last);
      final dir = await getApplicationDocumentsDirectory();
      final file = File('${dir.path}/${doc['fileName'] ?? 'document.pdf'}');
      await file.writeAsBytes(bytes);
      await AuthApiService.markDocumentAsRead(doc['_id']);
      if (mounted) Navigator.pop(context);
      await OpenFile.open(file.path);
    } catch (e) {
      if (mounted) Navigator.pop(context);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;
    final user = p.userProfile;
    final name = '${user?['prenom'] ?? ''} ${user?['nom'] ?? ''}'.trim();
    final fg = Theme.of(context).colorScheme.onSurface;
    final mt = dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    final cd = Theme.of(context).cardColor;
    final bd = dk ? Colors.white.withValues(alpha: 0.07) : Colors.black.withValues(alpha: 0.04);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
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
                        Text("Carte & Certificats", style: TextStyle(color: fg, fontSize: 22, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
                        Text("Badge Numérique · Documents RH", style: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                ],
              ).animate().fadeIn(),
            ),

            const SizedBox(height: 24),

            Expanded(
              child: _isLoading 
                ? const Center(child: CircularProgressIndicator())
                : SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  children: [
                    // WOW Business Card
                    _BusinessCard().animate().fadeIn(delay: 100.ms).slideY(begin: 0.05),

                    const SizedBox(height: 12),
                    Text(
                      "Touchez pour retourner · Glissez pour incliner en 3D",
                      style: TextStyle(color: mt, fontSize: 11, fontWeight: FontWeight.w600),
                    ),

                    const SizedBox(height: 24),

                    // Action Buttons
                    Row(
                      children: [
                        _actionBtn(Icons.share_rounded, "Partager", AppTheme.electricBlue, () {
                          HapticFeedback.lightImpact();
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text("Carte partagée ✓"), backgroundColor: AppTheme.electricBlue, behavior: SnackBarBehavior.floating),
                          );
                        }),
                        const SizedBox(width: 12),
                        _actionBtn(Icons.download_rounded, "Télécharger", AppTheme.emerald, () {
                          HapticFeedback.lightImpact();
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text("Téléchargement en cours..."), backgroundColor: AppTheme.emerald, behavior: SnackBarBehavior.floating),
                          );
                        }),
                        const SizedBox(width: 12),
                        _actionBtn(Icons.qr_code_rounded, "QR Code", const Color(0xFF7C3AED), () {
                          HapticFeedback.lightImpact();
                          _showQRDialog(context, user, name);
                        }),
                      ],
                    ).animate().fadeIn(delay: 200.ms),

                    const SizedBox(height: 28),

                    // Documents Section
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text("Mes Documents", style: TextStyle(color: fg, fontSize: 18, fontWeight: FontWeight.w800, letterSpacing: -0.3)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppTheme.electricBlue.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text("${_documents.length} docs", style: const TextStyle(color: AppTheme.electricBlue, fontSize: 11, fontWeight: FontWeight.w700)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    
                    if (_documents.isEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 30),
                        child: Center(
                          child: Column(
                            children: [
                              Icon(Icons.folder_open_rounded, color: mt.withValues(alpha: 0.5), size: 48),
                              const SizedBox(height: 12),
                              Text("Aucun document", style: TextStyle(color: mt, fontSize: 14, fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ),
                      )
                    else
                      ..._documents.asMap().entries.map((e) {
                        final doc = e.value;
                        final color = Color(doc['color'] as int);
                        final isSelected = _selectedDoc == e.key;
                        return GestureDetector(
                          onTap: () { HapticFeedback.selectionClick(); setState(() => _selectedDoc = e.key); },
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 250),
                            margin: const EdgeInsets.only(bottom: 10),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: isSelected ? color.withValues(alpha: 0.08) : cd,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: isSelected ? color.withValues(alpha: 0.4) : bd, width: isSelected ? 1.5 : 1),
                              boxShadow: isSelected
                                  ? [BoxShadow(color: color.withValues(alpha: 0.15), blurRadius: 12, offset: const Offset(0, 4))]
                                  : AppTheme.cardShadow(dk),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 44, height: 44,
                                  decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(14)),
                                  child: Icon(doc['icon'] as IconData, color: color, size: 22),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(doc['title'] as String, style: TextStyle(color: fg, fontSize: 13, fontWeight: FontWeight.w700)),
                                      const SizedBox(height: 3),
                                      Text("Généré le ${doc['date']}", style: TextStyle(color: mt, fontSize: 11, fontWeight: FontWeight.w500)),
                                    ],
                                  ),
                                ),
                                Row(children: [
                                  _docBtn(Icons.download_rounded, color, onTap: () => _downloadDoc(doc)),
                                  const SizedBox(width: 8),
                                  _docBtn(Icons.share_rounded, color, onTap: () {
                                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Option partage en cours...')));
                                  }),
                                ]),
                              ],
                            ),
                          ).animate().fadeIn(delay: (e.key * 60).ms),
                        );
                      }),

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

  Widget _docBtn(IconData icon, Color color, {VoidCallback? onTap}) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        if (onTap != null) onTap();
      },
      child: Container(
        width: 32, height: 32,
        decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
        child: Icon(icon, color: color, size: 16),
      ),
    );
  }

  Widget _actionBtn(IconData icon, String label, Color color, VoidCallback onTap) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          height: 58,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: color.withValues(alpha: 0.25)),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: color, size: 20),
              const SizedBox(height: 4),
              Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w700)),
            ],
          ),
        ),
      ),
    );
  }

  void _showQRDialog(BuildContext context, Map<String, dynamic>? user, String name) {
    final matricule = user?['matricule'] ?? 'N/A';
    showDialog(
      context: context,
      builder: (_) => Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.all(28),
          decoration: BoxDecoration(
            color: const Color(0xFF0E1827),
            borderRadius: BorderRadius.circular(28),
            border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text("QR Code — Carte Visite", style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800)),
              const SizedBox(height: 24),
              Container(
                width: 160, height: 160,
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                child: Center(
                  child: QrImageView(
                    data: 'Matricule: $matricule\nName: $name\nCompany: STB',
                    version: QrVersions.auto,
                    size: 140.0,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                "Matricule: $matricule\n$name — STB",
                style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 12, fontWeight: FontWeight.w600, height: 1.5),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  height: 46,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [AppTheme.electricBlue, AppTheme.royalBlue]),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Center(child: Text("Fermer", style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700))),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── WOW Business Card Widget (matches reference design) ──────────────────────
class _BusinessCard extends StatefulWidget {
  const _BusinessCard();
  @override
  State<_BusinessCard> createState() => _BusinessCardState();
}

class _BusinessCardState extends State<_BusinessCard> with TickerProviderStateMixin {
  late AnimationController _flipCtrl;
  late Animation<double> _flipAnim;
  late AnimationController _resetCtrl;
  late AnimationController _networkCtrl;
  late Animation<double> _networkAnim;

  bool _isFlipped = false;
  double _tiltX = 0.0;
  double _tiltY = 0.0;
  Offset _touchPos = Offset.zero;
  bool _dragging = false;

  ImageProvider? _getAvatarImageProvider(String? avatarUrl) {
    if (avatarUrl == null || avatarUrl.isEmpty) return null;
    try {
      if (avatarUrl.startsWith('data:image')) {
        final base64String = avatarUrl.split(',')[1];
        final bytes = base64Decode(base64String);
        return MemoryImage(bytes);
      } else {
        return NetworkImage(avatarUrl);
      }
    } catch (e) {
      print('Error loading avatar: $e');
      return null;
    }
  }

  @override
  void initState() {
    super.initState();
    _flipCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 650));
    _flipAnim = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _flipCtrl, curve: Curves.easeInOutCubic),
    );
    _resetCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 350));
    _networkCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 4))..repeat();
    _networkAnim = Tween<double>(begin: 0, end: 1).animate(_networkCtrl);
  }

  @override
  void dispose() {
    _flipCtrl.dispose();
    _resetCtrl.dispose();
    _networkCtrl.dispose();
    super.dispose();
  }

  void _onTap() {
    HapticFeedback.mediumImpact();
    _isFlipped ? _flipCtrl.reverse() : _flipCtrl.forward();
    setState(() => _isFlipped = !_isFlipped);
  }

  void _onPanUpdate(DragUpdateDetails d, Size size) {
    final rel = Offset(
      (d.localPosition.dx - size.width / 2) / (size.width / 2),
      (d.localPosition.dy - size.height / 2) / (size.height / 2),
    );
    setState(() {
      _tiltY = rel.dx * 0.16;
      _tiltX = -rel.dy * 0.16;
      _touchPos = d.localPosition;
      _dragging = true;
    });
  }

  void _onPanEnd(DragEndDetails _) {
    final startX = _tiltX;
    final startY = _tiltY;
    _resetCtrl.reset();
    _resetCtrl.addListener(() {
      setState(() {
        _tiltX = startX * (1 - _resetCtrl.value);
        _tiltY = startY * (1 - _resetCtrl.value);
      });
    });
    _resetCtrl.forward();
    setState(() => _dragging = false);
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (ctx, box) {
      final size = Size(box.maxWidth, 255.0);
      return GestureDetector(
        onTap: _onTap,
        onPanUpdate: (d) => _onPanUpdate(d, size),
        onPanEnd: _onPanEnd,
        onPanCancel: () => _onPanEnd(DragEndDetails()),
        child: AnimatedBuilder(
          animation: _flipAnim,
          builder: (ctx, _) {
            final angle = _flipAnim.value * math.pi;
            final isFront = angle <= math.pi / 2;
            final totalY = angle + _tiltY;
            return Transform(
              alignment: Alignment.center,
              transform: Matrix4.identity()
                ..setEntry(3, 2, 0.0015)
                ..rotateX(_tiltX)
                ..rotateY(totalY),
              child: SizedBox(
                width: size.width,
                height: size.height,
                child: Stack(children: [
                  isFront ? _buildFront(size) : Transform(
                    alignment: Alignment.center,
                    transform: Matrix4.identity()..rotateY(math.pi),
                    child: _buildBack(size),
                  ),
                  if (_dragging)
                    Positioned.fill(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(26),
                        child: CustomPaint(painter: _ShimmerPainter(_touchPos)),
                      ),
                    ),
                ]),
              ),
            );
          },
        ),
      );
    });
  }

  Widget _buildFront(Size size) {
    return Consumer<AppProvider>(
      builder: (context, provider, _) {
        final user = provider.userProfile;
        final avatar = _getAvatarImageProvider(user?['avatar']);
        final firstName = user?['prenom'] ?? '';
        final lastName = user?['nom'] ?? '';
        final fullName = '$firstName $lastName'.trim();
        final matricule = user?['matricule'] ?? '';
        final jobTitle = user?['poste'] ?? 'Employé';
        final email = user?['email'] ?? '';
        final phone = user?['phone'] ?? '';
        final initials = '${firstName.isNotEmpty ? firstName[0] : ''}${lastName.isNotEmpty ? lastName[0] : ''}'.toUpperCase();

        return AnimatedBuilder(
          animation: _networkAnim,
          builder: (_, __) => Container(
            width: size.width,
            height: size.height,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(26),
              boxShadow: [BoxShadow(color: const Color(0xFF1565C0).withValues(alpha: 0.5), blurRadius: 32, offset: const Offset(0, 14))],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(26),
              child: Stack(children: [
                // Deep blue background
                Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFF0A1A4A), Color(0xFF0D2266), Color(0xFF0F3080)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                ),
                // Animated neural network lines
                CustomPaint(
                  size: size,
                  painter: _NetworkPainter(_networkAnim.value),
                ),
                // Glassmorphism overlay
                Positioned.fill(
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 0.3, sigmaY: 0.3),
                    child: Container(color: Colors.transparent),
                  ),
                ),
                // Card content
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Top row: avatar + name + NFC
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Avatar circle
                          Column(
                            children: [
                              Container(
                                width: 56, height: 56,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(color: Colors.white.withValues(alpha: 0.5), width: 2),
                                  boxShadow: [BoxShadow(color: const Color(0xFF2962FF).withValues(alpha: 0.4), blurRadius: 12, offset: const Offset(0, 4))],
                                  color: avatar == null ? const Color(0xFF2962FF) : null,
                                  image: avatar != null ? DecorationImage(image: avatar, fit: BoxFit.cover) : null,
                                ),
                                child: avatar == null
                                    ? Center(child: Text(initials, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)))
                                    : null,
                              ),
                              const SizedBox(height: 5),
                              // Matricule chip
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                                ),
                                child: Text(matricule.isNotEmpty ? matricule : 'N/A', style: const TextStyle(color: Colors.white, fontSize: 8.5, fontWeight: FontWeight.w900, letterSpacing: 0.8)),
                              ),
                            ],
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(fullName.isNotEmpty ? fullName : 'Employé', style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 0.2)),
                                const SizedBox(height: 3),
                                Text(jobTitle, style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 10.5, fontWeight: FontWeight.w600)),
                                const SizedBox(height: 2),
                                Text(user?['position'] ?? 'Chef de Service Principal', style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 9.5, fontWeight: FontWeight.w600)),
                                const SizedBox(height: 3),
                                Text(user?['department']?.toString().toUpperCase() ?? 'DIR. DÉVELOPPEMENT DIGITAL', style: TextStyle(color: Colors.white.withValues(alpha: 0.45), fontSize: 7.5, fontWeight: FontWeight.w700, letterSpacing: 0.8)),
                          ],
                        ),
                      ),
                      // STB logo + NFC
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Container(
                            width: 34, height: 34,
                            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(9), border: Border.all(color: Colors.white.withValues(alpha: 0.2))),
                            child: const Icon(Icons.account_balance_rounded, color: Colors.white, size: 17),
                          ),
                          const SizedBox(height: 2),
                          const Text("STB", style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w900, letterSpacing: 1.5)),
                          const SizedBox(height: 8),
                          // NFC icon
                          Icon(Icons.wifi_rounded, color: Colors.white.withValues(alpha: 0.5), size: 18),
                        ],
                      ),
                    ],
                  ),
                      const Spacer(),
                      // Contact info row
                      if (phone.isNotEmpty) _contactRow(Icons.phone_rounded, phone),
                      if (phone.isNotEmpty) const SizedBox(height: 5),
                      if (email.isNotEmpty) _contactRow(Icons.email_rounded, email),
                      if (email.isNotEmpty) const SizedBox(height: 5),
                      _contactRow(Icons.language_rounded, "www.stb.com.tn"),
                      const SizedBox(height: 12),
                      // Bottom status bar
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFF10B981).withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                            ),
                            child: const Row(
                              children: [
                                Icon(Icons.circle, color: Color(0xFF10B981), size: 6),
                                SizedBox(width: 5),
                                Text("En Service · STB", style: TextStyle(color: Color(0xFF10B981), fontSize: 8.5, fontWeight: FontWeight.w800, letterSpacing: 0.3)),
                              ],
                            ),
                          ),
                          const Spacer(),
                          Text("Validité 12/2027", style: TextStyle(color: Colors.white.withValues(alpha: 0.4), fontSize: 8, fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ],
                  ),
                ),
                // QR code in bottom-right
                Positioned(
                  bottom: 16, right: 16,
                  child: Container(
                    width: 56, height: 56,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.3), blurRadius: 8, offset: const Offset(0, 3))],
                    ),
                    child: const Center(child: Icon(Icons.qr_code_2_rounded, size: 46, color: Color(0xFF0A1A4A))),
                  ),
                ),
              ]),
            ),
          ),
        );
      },
    );
  }


  Widget _contactRow(IconData icon, String text) {
    return Row(
      children: [
        Container(
          width: 26, height: 26,
          decoration: BoxDecoration(
            color: const Color(0xFF2962FF).withValues(alpha: 0.3),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: Colors.white, size: 13),
        ),
        const SizedBox(width: 8),
        Text(text, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w600)),
      ],
    );
  }

  Widget _buildBack(Size size) {
    return Container(
      width: size.width,
      height: size.height,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(26),
        gradient: const LinearGradient(
          colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.4), blurRadius: 30, offset: const Offset(0, 12))],
      ),
      child: Stack(children: [
        // Magnetic stripe
        Positioned(top: 32, left: 0, right: 0, child: Container(height: 36, color: Colors.black.withValues(alpha: 0.5))),
        Padding(
          padding: const EdgeInsets.fromLTRB(22, 86, 22, 22),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                height: 40,
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.9), borderRadius: BorderRadius.circular(8)),
                child: const Row(children: [
                  Text("Direction Développement Digital", style: TextStyle(color: Color(0xFF0F172A), fontSize: 11, fontWeight: FontWeight.w700)),
                ]),
              ),
              const Spacer(),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _backInfo("Direction", "Dév. Digital"),
                  _backInfo("Validité", "12/2027"),
                  Container(width: 36, height: 36, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)),
                      child: const Icon(Icons.qr_code_2_rounded, color: Color(0xFF0F172A), size: 28)),
                ],
              ),
            ],
          ),
        ),
      ]),
    );
  }

  Widget _backInfo(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white54, fontSize: 9, fontWeight: FontWeight.w600)),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
      ],
    );
  }
}

// ── Neural network animated background painter ─────────────────────────────
class _NetworkPainter extends CustomPainter {
  final double t;
  _NetworkPainter(this.t);

  final _nodes = [
    Offset(0.1, 0.2), Offset(0.3, 0.1), Offset(0.5, 0.3), Offset(0.7, 0.15),
    Offset(0.9, 0.25), Offset(0.15, 0.5), Offset(0.4, 0.55), Offset(0.6, 0.45),
    Offset(0.85, 0.6), Offset(0.2, 0.8), Offset(0.5, 0.75), Offset(0.8, 0.85),
  ];

  @override
  void paint(Canvas canvas, Size size) {
    final linePaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.08)
      ..strokeWidth = 0.8
      ..style = PaintingStyle.stroke;

    final nodePaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.18)
      ..style = PaintingStyle.fill;

    final glowPaint = Paint()
      ..color = const Color(0xFF00BFA5).withValues(alpha: 0.15)
      ..style = PaintingStyle.fill;

    // Draw connections
    for (int i = 0; i < _nodes.length; i++) {
      for (int j = i + 1; j < _nodes.length; j++) {
        final a = Offset(_nodes[i].dx * size.width, _nodes[i].dy * size.height);
        final b = Offset(_nodes[j].dx * size.width, _nodes[j].dy * size.height);
        if ((a - b).distance < size.width * 0.45) {
          canvas.drawLine(a, b, linePaint);
        }
      }
    }

    // Draw animated pulse on one node
    final pulseIndex = (t * _nodes.length).toInt() % _nodes.length;
    final pulseNode = Offset(_nodes[pulseIndex].dx * size.width, _nodes[pulseIndex].dy * size.height);
    final pulseRadius = 6 + (math.sin(t * math.pi * 2) * 4).abs();
    canvas.drawCircle(pulseNode, pulseRadius + 4, glowPaint..color = const Color(0xFF00BFA5).withValues(alpha: 0.1 + 0.1 * math.sin(t * math.pi * 2)));
    canvas.drawCircle(pulseNode, pulseRadius, glowPaint..color = const Color(0xFF00BFA5).withValues(alpha: 0.3));

    // Draw nodes
    for (final n in _nodes) {
      final pos = Offset(n.dx * size.width, n.dy * size.height);
      canvas.drawCircle(pos, 2.5, nodePaint);
    }
  }

  @override
  bool shouldRepaint(covariant _NetworkPainter old) => old.t != t;
}

// ── Light shimmer on touch ─────────────────────────────────────────────────
class _ShimmerPainter extends CustomPainter {
  final Offset pos;
  _ShimmerPainter(this.pos);

  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawCircle(
      pos,
      150,
      Paint()
        ..shader = RadialGradient(
          colors: [Colors.white.withValues(alpha: 0.12), Colors.white.withValues(alpha: 0.03), Colors.transparent],
          radius: 0.8,
        ).createShader(Rect.fromCircle(center: pos, radius: 150)),
    );
  }

  @override
  bool shouldRepaint(covariant _ShimmerPainter old) => old.pos != pos;
}
