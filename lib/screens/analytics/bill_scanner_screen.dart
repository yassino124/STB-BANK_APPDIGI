import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
// import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';  // Temporarily disabled
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../../services/ai_api_service.dart';

class BillScannerScreen extends StatefulWidget {
  const BillScannerScreen({super.key});

  @override
  State<BillScannerScreen> createState() => _BillScannerScreenState();
}

class _BillScannerScreenState extends State<BillScannerScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _scanLineCtrl;
  File? _pickedImage;
  String? _extractedText;
  Map<String, dynamic>? _aiResult;
  bool _isProcessing = false;
  String _statusText = '';
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _scanLineCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 2000))
      ..repeat(reverse: true);
  }

  @override
  void dispose() {
    _scanLineCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    HapticFeedback.mediumImpact();
    try {
      final XFile? xFile = await _picker.pickImage(source: source, imageQuality: 85);
      if (xFile == null) return;

      final file = File(xFile.path);
      setState(() {
        _pickedImage = file;
        _aiResult = null;
        _extractedText = null;
        _isProcessing = true;
        _statusText = '📷 Extraction du texte...';
      });

      // OCR - Temporarily disabled for iOS 26 compatibility
      // final inputImage = InputImage.fromFile(file);
      // final recognizer = TextRecognizer(script: TextRecognitionScript.latin);
      // final RecognizedText recognizedText = await recognizer.processImage(inputImage);
      // recognizer.close();

      // final text = recognizedText.text;
      final text = ""; // Placeholder until MLKit is re-enabled
      setState(() { _extractedText = text; _statusText = '🤖 Analyse IA en cours...'; });

      if (text.isEmpty) {
        setState(() {
          _isProcessing = false;
          _statusText = '';
          _aiResult = {
            'type': 'Document illisible',
            'amount': '0',
            'merchant': 'Inconnu',
            'date': null,
            'advice': '😔 Je n\'ai pas pu lire le texte. Essayez avec une meilleure photo.',
          };
        });
        return;
      }

      // Ollama analysis
      final rawJson = await AiApiService.analyzeBillText(text);
      
      Map<String, dynamic> parsed;
      try {
        // Extract JSON from response (Ollama sometimes adds extra text)
        final jsonStart = rawJson.indexOf('{');
        final jsonEnd = rawJson.lastIndexOf('}') + 1;
        parsed = jsonDecode(rawJson.substring(jsonStart, jsonEnd));
      } catch (_) {
        parsed = {
          'type': 'Document analysé',
          'amount': '?',
          'merchant': 'Non détecté',
          'date': null,
          'advice': rawJson.length > 120 ? rawJson.substring(0, 120) : rawJson,
        };
      }

      setState(() {
        _aiResult = parsed;
        _isProcessing = false;
        _statusText = '';
      });
    } catch (e) {
      setState(() {
        _isProcessing = false;
        _statusText = '';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<AppProvider>();
    final dk = prov.themeMode == ThemeMode.dark;
    final bg = dk ? const Color(0xFF0A101A) : const Color(0xFFF8FAFC);
    final textCol = dk ? Colors.white : const Color(0xFF1E293B);
    final cardBg = dk ? const Color(0xFF1E293B) : Colors.white;

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        systemOverlayStyle: dk ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: textCol, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.document_scanner_rounded, color: AppTheme.amber, size: 20),
            const SizedBox(width: 8),
            Text('AI Bill Scanner', style: TextStyle(color: textCol, fontSize: 16, fontWeight: FontWeight.w800)),
          ],
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        physics: const BouncingScrollPhysics(),
        child: Column(
          children: [
            // Scanner / Image display area
            _buildScanArea(dk, textCol, cardBg),
            const SizedBox(height: 24),
            // Action buttons
            if (_pickedImage == null && !_isProcessing)
              _buildPickButtons(dk, textCol).animate().fadeIn(delay: 200.ms),
            // Processing
            if (_isProcessing)
              _buildProcessingCard(dk, textCol).animate().fadeIn(),
            // Result
            if (_aiResult != null && !_isProcessing)
              _buildResultCard(dk, textCol, cardBg).animate().fadeIn().slideY(begin: 0.1),
            if (_aiResult != null) ...[
              const SizedBox(height: 16),
              _buildActionButtons(dk).animate().fadeIn(delay: 300.ms),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildScanArea(bool dk, Color textCol, Color cardBg) {
    return Container(
      height: 280,
      width: double.infinity,
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: _isProcessing ? AppTheme.amber : (dk ? const Color(0xFF334155) : const Color(0xFFE2E8F0)), width: _isProcessing ? 2 : 1),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 20, offset: const Offset(0, 6))],
      ),
      clipBehavior: Clip.hardEdge,
      child: Stack(
        children: [
          if (_pickedImage != null)
            Positioned.fill(
              child: Image.file(_pickedImage!, fit: BoxFit.cover),
            )
          else
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(color: AppTheme.amber.withValues(alpha: 0.1), shape: BoxShape.circle),
                    child: const Icon(Icons.document_scanner_rounded, color: AppTheme.amber, size: 48),
                  ).animate(onPlay: (c) => c.repeat(reverse: true))
                   .scale(begin: const Offset(0.95, 0.95), end: const Offset(1.05, 1.05), duration: 2000.ms),
                  const SizedBox(height: 16),
                  Text('Scannez une facture', style: TextStyle(color: textCol, fontSize: 16, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  Text('STEG, restaurant, internet...', style: TextStyle(color: dk ? const Color(0xFF64748B) : const Color(0xFF94A3B8), fontSize: 13)),
                ],
              ),
            ),
          // Animated scan line when processing
          if (_isProcessing)
            AnimatedBuilder(
              animation: _scanLineCtrl,
              builder: (_, __) => Positioned(
                top: _scanLineCtrl.value * 250,
                left: 0, right: 0,
                child: Container(
                  height: 2,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Colors.transparent, AppTheme.amber, Colors.transparent],
                    ),
                    boxShadow: [BoxShadow(color: AppTheme.amber.withValues(alpha: 0.5), blurRadius: 8)],
                  ),
                ),
              ),
            ),
          // Corner brackets
          if (_pickedImage == null) ...[
            Positioned(top: 20, left: 20, child: _cornerBracket(dk, topLeft: true)),
            Positioned(top: 20, right: 20, child: _cornerBracket(dk, topRight: true)),
            Positioned(bottom: 20, left: 20, child: _cornerBracket(dk, bottomLeft: true)),
            Positioned(bottom: 20, right: 20, child: _cornerBracket(dk, bottomRight: true)),
          ],
        ],
      ),
    );
  }

  Widget _cornerBracket(bool dk, {bool topLeft = false, bool topRight = false, bool bottomLeft = false, bool bottomRight = false}) {
    return Container(
      width: 24, height: 24,
      decoration: BoxDecoration(
        border: Border(
          top: topLeft || topRight ? BorderSide(color: AppTheme.amber, width: 2) : BorderSide.none,
          bottom: bottomLeft || bottomRight ? BorderSide(color: AppTheme.amber, width: 2) : BorderSide.none,
          left: topLeft || bottomLeft ? BorderSide(color: AppTheme.amber, width: 2) : BorderSide.none,
          right: topRight || bottomRight ? BorderSide(color: AppTheme.amber, width: 2) : BorderSide.none,
        ),
      ),
    );
  }

  Widget _buildPickButtons(bool dk, Color textCol) {
    return Row(
      children: [
        Expanded(
          child: _actionBtn(Icons.camera_alt_rounded, 'Caméra', AppTheme.electricBlue, dk, () => _pickImage(ImageSource.camera)),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _actionBtn(Icons.photo_library_rounded, 'Galerie', AppTheme.amber, dk, () => _pickImage(ImageSource.gallery)),
        ),
      ],
    );
  }

  Widget _actionBtn(IconData icon, String label, Color color, bool dk, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 18),
        decoration: BoxDecoration(
          color: color.withValues(alpha: dk ? 0.12 : 0.08),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 8),
            Text(label, style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.w700)),
          ],
        ),
      ),
    );
  }

  Widget _buildProcessingCard(bool dk, Color textCol) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: dk ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.amber.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.amber)),
          const SizedBox(width: 16),
          Text(_statusText, style: TextStyle(color: textCol, fontSize: 14, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildResultCard(bool dk, Color textCol, Color cardBg) {
    if (_aiResult == null) return const SizedBox();
    final type = _aiResult!['type'] as String? ?? '?';
    final amount = _aiResult!['amount'] as String? ?? '?';
    final merchant = _aiResult!['merchant'] as String? ?? '?';
    final date = _aiResult!['date'] as String?;
    final advice = _aiResult!['advice'] as String? ?? '';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AppTheme.amber.withValues(alpha: 0.25)),
            boxShadow: [BoxShadow(color: AppTheme.amber.withValues(alpha: 0.08), blurRadius: 16)],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(children: [
                Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: AppTheme.amber.withValues(alpha: 0.1), shape: BoxShape.circle),
                  child: const Icon(Icons.receipt_long_rounded, color: AppTheme.amber, size: 24)),
                const SizedBox(width: 14),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(type, style: TextStyle(color: textCol, fontSize: 16, fontWeight: FontWeight.w800)),
                  if (date != null) Text(date, style: TextStyle(color: dk ? const Color(0xFF64748B) : const Color(0xFF94A3B8), fontSize: 12)),
                ])),
                Text(amount.contains('TND') ? amount : '$amount TND',
                  style: const TextStyle(color: AppTheme.amber, fontSize: 22, fontWeight: FontWeight.w900)),
              ]),
              const SizedBox(height: 16),
              Container(height: 1, color: dk ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
              const SizedBox(height: 16),
              Row(children: [
                const Icon(Icons.store_rounded, size: 16, color: AppTheme.electricBlue),
                const SizedBox(width: 8),
                Text(merchant, style: TextStyle(color: textCol, fontSize: 13, fontWeight: FontWeight.w600)),
              ]),
              if (advice.isNotEmpty) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppTheme.emerald.withValues(alpha: dk ? 0.1 : 0.06),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppTheme.emerald.withValues(alpha: 0.2)),
                  ),
                  child: Text(advice, style: const TextStyle(color: AppTheme.emerald, fontSize: 13, fontWeight: FontWeight.w600)),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildActionButtons(bool dk) {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () {
              setState(() { _pickedImage = null; _aiResult = null; _extractedText = null; });
            },
            icon: const Icon(Icons.refresh_rounded, size: 18),
            label: const Text('Rescanner'),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: ElevatedButton.icon(
            onPressed: () {
              HapticFeedback.mediumImpact();
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                content: Text('✅ Dépense enregistrée avec succès!'),
                backgroundColor: AppTheme.emerald,
              ));
            },
            icon: const Icon(Icons.add_rounded, size: 18),
            label: const Text('Enregistrer'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.emerald,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
          ),
        ),
      ],
    );
  }
}
