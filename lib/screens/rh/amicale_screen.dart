import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../services/auth_api_service.dart';
import '../../theme/app_theme.dart';
import 'dart:ui';
import 'dart:math' as math;

// Global helper to get image provider (handles base64 or URL)
ImageProvider getAmicaleImageProvider(String imgUrl) {
  if (imgUrl.startsWith('data:image')) {
    try {
      final base64String = imgUrl.split(',')[1];
      final bytes = base64Decode(base64String);
      return MemoryImage(bytes);
    } catch (e) {
      debugPrint('Error decoding base64 image: $e');
      return const NetworkImage('https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=800&q=80');
    }
  } else {
    return NetworkImage(imgUrl);
  }
}

class AmicaleScreen extends StatefulWidget {
  const AmicaleScreen({super.key});
  @override
  State<AmicaleScreen> createState() => _AmicaleScreenState();
}

class _AmicaleScreenState extends State<AmicaleScreen> with TickerProviderStateMixin {
  late AnimationController _bgCtrl;
  late PageController _pageCtrl;
  Timer? _timer;
  int _selectedCat = 0;
  int _currentFeatured = 0;
  bool _isListening = false;
  bool _searchActive = false;
  final _searchCtrl = TextEditingController();
  String _searchQuery = '';

  final _categories = ['Tout', 'Voyages', 'Hôtels', 'Bien-être'];
  
  List<Map<String, dynamic>> _offres = [];
  bool _isLoading = true;

  Future<void> _fetchOffers() async {
    try {
      final res = await AuthApiService.getAmicaleOffers();
      if (res.isSuccess && res.data != null) {
        setState(() {
          _offres = (res.data as List).map((o) {
            return <String, dynamic>{
              '_id': o['_id'] ?? '',
              'title': o['title'] ?? '',
              'sub': o['sub'] ?? '',
              'cat': o['cat'] ?? 'Voyages',
              'img': o['img'] ?? 'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=800&q=80',
              'price': o['price'] ?? '',
              'color': o['color'] != null
                  ? int.tryParse((o['color'] as String).replaceAll('#', '0xFF')) ?? 0xFF7C3AED
                  : 0xFF7C3AED,
              'desc': o['desc'] ?? '',
            };
          }).toList();
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      debugPrint('Amicale fetch error: $e');
      setState(() => _isLoading = false);
    }
  }

  @override
  void initState() {
    super.initState();
    _bgCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 15))..repeat();
    _pageCtrl = PageController(viewportFraction: 0.9);
    _fetchOffers();
    
    // Auto-scroll animation for featured offers
    _timer = Timer.periodic(const Duration(seconds: 4), (Timer timer) {
      if (_pageCtrl.hasClients) {
        int next = (_offres.isNotEmpty) ? (_pageCtrl.page!.round() + 1) % math.min(3, _offres.length) : 0;
        if (_offres.isNotEmpty) {
          _pageCtrl.animateToPage(
            next,
          duration: const Duration(milliseconds: 800),
          curve: Curves.fastOutSlowIn,
          );
        }
      }
    });
  }

  @override
  void dispose() {
    _bgCtrl.dispose();
    _pageCtrl.dispose();
    _searchCtrl.dispose();
    _timer?.cancel();
    super.dispose();
  }

  void _onVoiceSearch() {
    HapticFeedback.heavyImpact();
    setState(() => _isListening = !_isListening);
    if (_isListening) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Row(children: [
            Icon(Icons.mic_rounded, color: Colors.white),
            SizedBox(width: 12),
            Text("Écoute en cours (IA STB)...", style: TextStyle(fontWeight: FontWeight.w700)),
          ]),
          backgroundColor: AppTheme.electricBlue,
          behavior: SnackBarBehavior.floating,
          duration: Duration(seconds: 3),
        ),
      );
      Future.delayed(const Duration(seconds: 3), () {
        if (mounted) setState(() => _isListening = false);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;
    final fg = Theme.of(context).colorScheme.onSurface;
    final mt = dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    final cd = Theme.of(context).cardColor;
    final bd = dk ? Colors.white.withValues(alpha: 0.07) : Colors.black.withValues(alpha: 0.04);

    final filtered = _selectedCat == 0
        ? _offres
        : _offres.where((o) => o['cat'] == _categories[_selectedCat]).toList();
    final displayOffres = _searchQuery.isEmpty
        ? filtered
        : filtered.where((o) =>
            (o['title'] as String).toLowerCase().contains(_searchQuery.toLowerCase()) ||
            (o['cat'] as String).toLowerCase().contains(_searchQuery.toLowerCase())).toList();

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: Stack(
        children: [
          Positioned.fill(
            child: AnimatedBuilder(
              animation: _bgCtrl,
              builder: (_, __) {
                return CustomPaint(painter: _AmicaleBgPainter(_bgCtrl.value, dk));
              },
            ),
          ),
          SafeArea(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : CustomScrollView(
                    physics: const BouncingScrollPhysics(),
                    slivers: [
                      // Header
                      SliverToBoxAdapter(
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
                          child: Column(
                            children: [
                              Row(
                                children: [
                                  GestureDetector(
                                    onTap: () { HapticFeedback.lightImpact(); Navigator.pop(context); },
                                    child: Container(
                                      width: 44, height: 44,
                                      decoration: BoxDecoration(color: cd, shape: BoxShape.circle, border: Border.all(color: bd), boxShadow: AppTheme.cardShadow(dk)),
                                      child: Icon(Icons.arrow_back_rounded, color: fg, size: 20),
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text("Amicale STB", style: TextStyle(color: fg, fontSize: 24, fontWeight: FontWeight.w900)),
                                        Text("Voyages, Hôtels & Offres Exclusives", style: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w600)),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              // Search Bar
                              AnimatedContainer(
                                duration: const Duration(milliseconds: 300),
                                height: 54,
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                decoration: BoxDecoration(
                                  color: _isListening ? AppTheme.electricBlue.withValues(alpha: dk ? 0.2 : 0.08) : cd,
                                  borderRadius: BorderRadius.circular(18),
                                  border: Border.all(color: _isListening ? AppTheme.electricBlue.withValues(alpha: 0.5) : bd),
                                ),
                                child: Row(
                                  children: [
                                    Icon(Icons.search_rounded, color: _isListening ? AppTheme.electricBlue : mt, size: 22),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: TextField(
                                        controller: _searchCtrl,
                                        onChanged: (v) => setState(() => _searchQuery = v),
                                        style: TextStyle(color: fg, fontSize: 14, fontWeight: FontWeight.w600),
                                        decoration: InputDecoration(
                                          hintText: "Chercher une destination...",
                                          hintStyle: TextStyle(color: mt.withValues(alpha: 0.7), fontSize: 14),
                                          border: InputBorder.none,
                                          isDense: true,
                                          contentPadding: EdgeInsets.zero,
                                        ),
                                      ),
                                    ),
                                    if (_searchQuery.isNotEmpty)
                                      GestureDetector(
                                        onTap: () { _searchCtrl.clear(); setState(() => _searchQuery = ''); },
                                        child: Icon(Icons.close_rounded, color: mt, size: 18),
                                      ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      // Featured Carousel
                      if (_offres.isNotEmpty)
                        SliverToBoxAdapter(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Padding(
                                padding: const EdgeInsets.fromLTRB(20, 10, 20, 14),
                                child: Row(
                                  children: [
                                    Text("À la Une", style: TextStyle(color: fg, fontSize: 18, fontWeight: FontWeight.w800)).animate().fadeIn(delay: 100.ms),
                                    const Spacer(),
                                    Row(
                                      children: List.generate(math.min(3, _offres.length), (i) => AnimatedContainer(
                                        duration: const Duration(milliseconds: 350),
                                        margin: const EdgeInsets.only(left: 5),
                                        width: _currentFeatured == i ? 20 : 6,
                                        height: 6,
                                        decoration: BoxDecoration(
                                          color: _currentFeatured == i ? AppTheme.electricBlue : mt.withValues(alpha: 0.3),
                                          borderRadius: BorderRadius.circular(3),
                                        ),
                                      )),
                                    ),
                                  ],
                                ),
                              ),
                              SizedBox(
                                height: 200,
                                child: PageView.builder(
                                  controller: _pageCtrl,
                                  onPageChanged: (idx) => setState(() => _currentFeatured = idx),
                                  physics: const BouncingScrollPhysics(),
                                  itemCount: math.min(3, _offres.length),
                                  itemBuilder: (context, i) {
                                    final o = _offres[i];
                                    final color = Color(o['color'] as int);
                                    final isActive = _currentFeatured == i;
                                    return AnimatedScale(
                                      duration: const Duration(milliseconds: 400),
                                      curve: Curves.easeOutCubic,
                                      scale: isActive ? 1.0 : 0.92,
                                      child: GestureDetector(
                                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => _AmicaleDetailScreen(offer: o, heroTag: 'featured_${o['title']}'))),
                                        child: Container(
                                          margin: const EdgeInsets.symmetric(horizontal: 4),
                                          decoration: BoxDecoration(
                                            borderRadius: BorderRadius.circular(24),
                                            boxShadow: isActive ? [BoxShadow(color: color.withValues(alpha: 0.25), blurRadius: 20, offset: const Offset(0, 8))] : [],
                                          ),
                                          child: ClipRRect(
                                            borderRadius: BorderRadius.circular(24),
                                            child: Stack(
                                              fit: StackFit.expand,
                                              children: [
                                                Hero(
                                                  tag: 'featured_${o['title']}',
                                                  child: Image(
                                                    image: getAmicaleImageProvider(o['img'] as String),
                                                    fit: BoxFit.cover,
                                                    errorBuilder: (_, __, ___) => Container(color: color.withValues(alpha: 0.3)),
                                                  ),
                                                ),
                                                Container(
                                                  decoration: BoxDecoration(
                                                    gradient: LinearGradient(colors: [Colors.transparent, Colors.black.withValues(alpha: 0.9)], begin: Alignment.topCenter, end: Alignment.bottomCenter),
                                                  ),
                                                ),
                                                Positioned(
                                                  bottom: 16, left: 16, right: 16,
                                                  child: Column(
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    children: [
                                                      Container(
                                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                        decoration: BoxDecoration(color: color.withValues(alpha: 0.9), borderRadius: BorderRadius.circular(8)),
                                                        child: Text(o['cat'] as String, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800)),
                                                      ),
                                                      const SizedBox(height: 8),
                                                      Text(o['title'] as String, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900, letterSpacing: -0.3)),
                                                      const SizedBox(height: 4),
                                                      Row(
                                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                        children: [
                                                          Text(o['sub'] as String, style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 12, fontWeight: FontWeight.w600)),
                                                          Text(o['price'] as String, style: const TextStyle(color: AppTheme.emerald, fontSize: 15, fontWeight: FontWeight.w900)),
                                                        ],
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ),
                                    );
                                  },
                                ),
                              ).animate().fadeIn(delay: 150.ms),
                            ],
                          ),
                        ),

                      // Categories
                      SliverToBoxAdapter(
                        child: Padding(
                          padding: const EdgeInsets.only(top: 28, bottom: 16),
                          child: SizedBox(
                            height: 40,
                            child: ListView.separated(
                              padding: const EdgeInsets.symmetric(horizontal: 20),
                              scrollDirection: Axis.horizontal,
                              physics: const BouncingScrollPhysics(),
                              itemCount: _categories.length,
                              separatorBuilder: (_, __) => const SizedBox(width: 10),
                              itemBuilder: (context, i) {
                                final isSelected = _selectedCat == i;
                                return GestureDetector(
                                  onTap: () {
                                    HapticFeedback.selectionClick();
                                    setState(() => _selectedCat = i);
                                  },
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 300),
                                    padding: const EdgeInsets.symmetric(horizontal: 20),
                                    alignment: Alignment.center,
                                    decoration: BoxDecoration(
                                      color: isSelected ? AppTheme.electricBlue : cd.withValues(alpha: 0.6),
                                      borderRadius: BorderRadius.circular(20),
                                      border: Border.all(color: isSelected ? Colors.transparent : bd),
                                      boxShadow: isSelected ? [BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.3), blurRadius: 10, offset: const Offset(0, 4))] : [],
                                    ),
                                    child: Text(
                                      _categories[i],
                                      style: TextStyle(
                                        color: isSelected ? Colors.white : fg,
                                        fontSize: 13,
                                        fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                );
                              },
                            ).animate().fadeIn(delay: 200.ms),
                          ),
                        ),
                      ),

                      // Grid
                      SliverPadding(
                        padding: const EdgeInsets.fromLTRB(20, 10, 20, 100),
                        sliver: SliverGrid(
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            mainAxisSpacing: 16,
                            crossAxisSpacing: 16,
                            childAspectRatio: 0.65,
                          ),
                          delegate: SliverChildBuilderDelegate(
                            (context, i) {
                              final o = displayOffres[i];
                              return _OfferCard(
                                offer: o,
                                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => _AmicaleDetailScreen(offer: o, heroTag: 'img_${o['title']}_$i'))),
                                heroTag: 'img_${o['title']}_$i',
                              ).animate(key: ValueKey(o['title'])).fadeIn(delay: (i * 80).ms).slideY(begin: 0.05);
                            },
                            childCount: displayOffres.length,
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
}

class _OfferCard extends StatelessWidget {
  final Map<String, dynamic> offer;
  final VoidCallback onTap;
  final String heroTag;

  const _OfferCard({required this.offer, required this.onTap, required this.heroTag});

  @override
  Widget build(BuildContext context) {
    final color = Color(offer['color'] as int);
    
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        onTap();
      },
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.15), blurRadius: 16, offset: const Offset(0, 8))],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(24),
          child: Stack(
            fit: StackFit.expand,
            children: [
              // Hero Image
              Hero(
                tag: heroTag,
                child: Image(
                  image: getAmicaleImageProvider(offer['img'] as String),
                  fit: BoxFit.cover,
                  loadingBuilder: (ctx, child, progress) {
                    if (progress == null) return child;
                    return Container(color: color.withValues(alpha: 0.2), child: const Center(child: CircularProgressIndicator(strokeWidth: 2)));
                  },
                  errorBuilder: (ctx, err, stack) => Container(color: color.withValues(alpha: 0.2)),
                ),
              ),
              // Gradient Overlay
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.black.withValues(alpha: 0.0), Colors.black.withValues(alpha: 0.85)],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
              ),
              // Category Tag
              Positioned(
                top: 12, right: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.9),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                  ),
                  child: Text(offer['cat'] as String, style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800)),
                ),
              ),
              // Bottom content
              Positioned(
                bottom: 12, left: 12, right: 12,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(offer['title'] as String, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w900, letterSpacing: -0.2), maxLines: 2, overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 2),
                    Text(offer['sub'] as String, style: TextStyle(color: Colors.white.withValues(alpha: 0.75), fontSize: 9, fontWeight: FontWeight.w600), maxLines: 1, overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(offer['price'] as String, style: const TextStyle(color: AppTheme.emerald, fontSize: 12, fontWeight: FontWeight.w900)),
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), shape: BoxShape.circle),
                          child: const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 12),
                        ),
                      ],
                    ),
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

class _AmicaleDetailScreen extends StatefulWidget {
  final Map<String, dynamic> offer;
  final String heroTag;
  
  const _AmicaleDetailScreen({required this.offer, required this.heroTag});

  @override
  State<_AmicaleDetailScreen> createState() => _AmicaleDetailScreenState();
}

class _AmicaleDetailScreenState extends State<_AmicaleDetailScreen> {
  bool _isReserved = false;

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;
    final fg = Theme.of(context).colorScheme.onSurface;
    final mt = dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    final cd = Theme.of(context).cardColor;
    final color = Color(widget.offer['color'] as int);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          SliverAppBar(
            expandedHeight: 380,
            pinned: true,
            stretch: true,
            backgroundColor: Theme.of(context).scaffoldBackgroundColor,
            leading: GestureDetector(
              onTap: () { HapticFeedback.lightImpact(); Navigator.pop(context); },
              child: Container(
                margin: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: Colors.black.withValues(alpha: 0.3), shape: BoxShape.circle),
                child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
              ),
            ),
            flexibleSpace: FlexibleSpaceBar(
              stretchModes: const [StretchMode.zoomBackground, StretchMode.blurBackground],
              background: Hero(
                tag: widget.heroTag,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image(
                      image: getAmicaleImageProvider(widget.offer['img'] as String),
                      fit: BoxFit.cover,
                      errorBuilder: (_,__,___) => Container(color: color),
                    ),
                    Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Colors.black.withValues(alpha: 0.1), Theme.of(context).scaffoldBackgroundColor],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 120),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(color: color.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
                    child: Text(widget.offer['cat'] as String, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w800)),
                  ).animate().fadeIn().slideY(begin: 0.1),
                  const SizedBox(height: 12),
                  Text(widget.offer['title'] as String, style: TextStyle(color: fg, fontSize: 28, fontWeight: FontWeight.w900, letterSpacing: -0.5)).animate().fadeIn(delay: 50.ms).slideY(begin: 0.1),
                  const SizedBox(height: 6),
                  Text(widget.offer['sub'] as String, style: TextStyle(color: mt, fontSize: 14, fontWeight: FontWeight.w600)).animate().fadeIn(delay: 100.ms).slideY(begin: 0.1),
                  
                  const SizedBox(height: 24),
                  
                  // Price Tag Box
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: cd,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: dk ? Colors.white.withValues(alpha: 0.05) : Colors.black.withValues(alpha: 0.05)),
                      boxShadow: AppTheme.cardShadow(dk),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text("Prix préférentiel Amicale", style: TextStyle(color: mt, fontSize: 11, fontWeight: FontWeight.w600)),
                            const SizedBox(height: 4),
                            Text(widget.offer['price'] as String, style: const TextStyle(color: AppTheme.emerald, fontSize: 22, fontWeight: FontWeight.w900, letterSpacing: -0.5)),
                          ],
                        ),
                        Container(
                          width: 48, height: 48,
                          decoration: BoxDecoration(color: AppTheme.emerald.withValues(alpha: 0.1), shape: BoxShape.circle),
                          child: const Icon(Icons.sell_rounded, color: AppTheme.emerald, size: 24),
                        ),
                      ],
                    ),
                  ).animate().fadeIn(delay: 150.ms).slideY(begin: 0.1),
                  
                  const SizedBox(height: 32),
                  
                  Text("À propos de l'offre", style: TextStyle(color: fg, fontSize: 18, fontWeight: FontWeight.w800, letterSpacing: -0.3)).animate().fadeIn(delay: 200.ms),
                  const SizedBox(height: 12),
                  Text(
                    widget.offer['desc'] as String,
                    style: TextStyle(color: mt.withValues(alpha: 0.9), fontSize: 14, fontWeight: FontWeight.w500, height: 1.6),
                  ).animate().fadeIn(delay: 250.ms),
                  
                  const SizedBox(height: 32),
                  
                  // Options
                  Text("Inclus", style: TextStyle(color: fg, fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: -0.3)).animate().fadeIn(delay: 300.ms),
                  const SizedBox(height: 12),
                  _featureRow(Icons.check_circle_rounded, "Facilité de paiement sur 6 mois (sans frais)"),
                  _featureRow(Icons.check_circle_rounded, "Prélèvement automatique sur le salaire"),
                  _featureRow(Icons.check_circle_rounded, "Avantage spécial collaborateurs STB"),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: GestureDetector(
            onTap: () {
              if (_isReserved) return;
              HapticFeedback.mediumImpact();
              setState(() => _isReserved = true);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Demande de réservation envoyée ✓"), backgroundColor: AppTheme.emerald, behavior: SnackBarBehavior.floating),
              );
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              height: 56,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: _isReserved ? [const Color(0xFF10B981), const Color(0xFF059669)] : [color, color.withValues(alpha: 0.8)],
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(color: (_isReserved ? const Color(0xFF10B981) : color).withValues(alpha: 0.35), blurRadius: 16, offset: const Offset(0, 6)),
                ],
              ),
              child: Center(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(_isReserved ? Icons.check_circle_rounded : Icons.calendar_month_rounded, color: Colors.white, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      _isReserved ? "Réservé" : "Demander une réservation",
                      style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _featureRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, color: AppTheme.emerald, size: 18),
          const SizedBox(width: 10),
          Expanded(child: Text(text, style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.8), fontSize: 13, fontWeight: FontWeight.w600))),
        ],
      ),
    ).animate().fadeIn(delay: 350.ms);
  }
}

class _AmicaleBgPainter extends CustomPainter {
  final double t;
  final bool dk;
  _AmicaleBgPainter(this.t, this.dk);

  @override
  void paint(Canvas canvas, Size size) {
    void orb(double dx, double dy, double r, Color c) {
      canvas.drawCircle(Offset(dx, dy), r, Paint()
        ..color = c
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 80));
    }
    final alpha = dk ? 0.08 : 0.05;
    orb(size.width * (0.2 + 0.1 * math.sin(t * 2 * math.pi)), size.height * (0.2 + 0.1 * math.cos(t * 2 * math.pi)), 150, const Color(0xFF7C3AED).withValues(alpha: alpha));
    orb(size.width * (0.8 + 0.1 * math.cos(t * 2 * math.pi)), size.height * (0.8 + 0.1 * math.sin(t * 2 * math.pi)), 150, const Color(0xFF00BFA5).withValues(alpha: alpha));
  }

  @override
  bool shouldRepaint(covariant _AmicaleBgPainter old) => old.t != t || old.dk != dk;
}
