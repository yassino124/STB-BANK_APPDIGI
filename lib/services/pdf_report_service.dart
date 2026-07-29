import 'dart:io';
import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:open_file/open_file.dart';

class PdfReportService {
  static const stbBlue  = PdfColor.fromInt(0xFF0D47A1);
  static const stbCyan  = PdfColor.fromInt(0xFF0288D1);
  static const stbGreen = PdfColor.fromInt(0xFF065F46);
  static const stbGold  = PdfColor.fromInt(0xFFD97706);
  static const stbDark  = PdfColor.fromInt(0xFF0F172A);
  static const stbGray  = PdfColor.fromInt(0xFF64748B);
  static const stbLightBg = PdfColor.fromInt(0xFFEFF6FF);

  static String _monthName(int m) {
    const months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    return months[m - 1];
  }

  static String _generateAITip(double savingsRate, double solde, double salaire, int conges, double credits) {
    final tips = <String>[];
    if (savingsRate < 20) tips.add('Votre taux d\'épargne est de ${savingsRate.toStringAsFixed(0)}% — en dessous de la recommandation de 20%. Essayez de réduire les dépenses non essentielles.');
    if (savingsRate >= 20) tips.add('Excellent taux d\'épargne de ${savingsRate.toStringAsFixed(0)}% ! Pensez à placer votre surplus dans un DAT ou SICAV STB pour faire fructifier votre argent.');
    if (conges > 20) tips.add('Vous avez $conges jours de congé — planifiez vos vacances avant fin d\'année.');
    if (credits > salaire * 6) tips.add('Vos crédits représentent plus de 6 mois de salaire. Envisagez un remboursement anticipé.');
    if (solde > salaire * 3) tips.add('Votre solde est confortable. Un placement épargne peut générer jusqu\'à 5.2%/an.');
    return tips.isNotEmpty ? tips.join('\n\n') : 'Votre situation financière est stable. Continuez à épargner et consultez nos offres d\'investissement.';
  }

  static pw.Widget _statCard(pw.Font fb, pw.Font f, String label, String value, PdfColor color, PdfColor bg) {
    return pw.Expanded(child: pw.Container(
      padding: const pw.EdgeInsets.all(12),
      decoration: pw.BoxDecoration(color: bg, borderRadius: pw.BorderRadius.circular(10)),
      child: pw.Column(crossAxisAlignment: pw.CrossAxisAlignment.start, children: [
        pw.Text(label, style: pw.TextStyle(font: f, fontSize: 8, color: PdfColors.grey600)),
        pw.SizedBox(height: 4),
        pw.Text(value, style: pw.TextStyle(font: fb, fontSize: 10, color: color)),
      ]),
    ));
  }

  static pw.Widget _rhItem(pw.Font fb, pw.Font f, String label, String value) {
    return pw.Expanded(child: pw.Column(crossAxisAlignment: pw.CrossAxisAlignment.start, children: [
      pw.Text(label, style: pw.TextStyle(font: f, fontSize: 8, color: PdfColors.grey600)),
      pw.SizedBox(height: 3),
      pw.Text(value, style: pw.TextStyle(font: fb, fontSize: 10, color: stbBlue)),
    ]));
  }

  static Future<String> generateMonthlyReport({
    required String prenom,
    required String nom,
    required String poste,
    required double solde,
    required double salaireBase,
    required int soldeConges,
    required double prime,
    required double creditsEnCours,
    required List<dynamic> transactions,
  }) async {
    final pdf = pw.Document();
    final now = DateTime.now();
    final mois = _monthName(now.month);
    final annee = now.year.toString();

    pw.Font font;
    pw.Font fontBold;
    try {
      font = pw.Font.ttf(await rootBundle.load('assets/fonts/Outfit-Regular.ttf'));
      fontBold = pw.Font.ttf(await rootBundle.load('assets/fonts/Outfit-Bold.ttf'));
    } catch (_) {
      font = pw.Font.helvetica();
      fontBold = pw.Font.helveticaBold();
    }

    final totalIn  = transactions.where((t) => (t['montant'] as num? ?? 0) > 0).fold<double>(0, (a, t) => a + ((t['montant'] as num?)?.toDouble() ?? 0));
    final totalOut = transactions.where((t) => (t['montant'] as num? ?? 0) < 0).fold<double>(0, (a, t) => a + ((t['montant'] as num?)?.toDouble() ?? 0)).abs();
    final netFlow  = totalIn - totalOut;
    final savingsRate = totalIn > 0 ? ((totalIn - totalOut) / totalIn * 100).clamp(0, 100) : 0;
    final score = (savingsRate * 0.4 + (creditsEnCours < salaireBase * 3 ? 30 : 10) + (solde > salaireBase ? 30 : 10)).clamp(0, 100).round();
    final scoreLabel = score >= 80 ? 'Excellent' : score >= 60 ? 'Bon' : score >= 40 ? 'Moyen' : 'A ameliorer';
    final tip = _generateAITip(savingsRate.toDouble(), solde, salaireBase, soldeConges, creditsEnCours);

    final Map<String, double> catMap = {};
    for (final t in transactions) {
      final cat = t['categorie'] as String? ?? t['type'] as String? ?? 'Autre';
      final amt = ((t['montant'] as num?)?.toDouble() ?? 0).abs();
      catMap[cat] = (catMap[cat] ?? 0) + amt;
    }
    final top5 = (catMap.entries.toList()..sort((a, b) => b.value.compareTo(a.value))).take(5).toList();
    final colors = [stbBlue, stbCyan, stbGold, stbGreen, PdfColor.fromInt(0xFF7C3AED)];

    pdf.addPage(pw.MultiPage(
      pageFormat: PdfPageFormat.a4,
      margin: const pw.EdgeInsets.all(32),
      build: (ctx) => [
        // Header
        pw.Container(
          padding: const pw.EdgeInsets.all(20),
          decoration: pw.BoxDecoration(
            gradient: const pw.LinearGradient(colors: [stbBlue, stbCyan]),
            borderRadius: pw.BorderRadius.circular(16),
          ),
          child: pw.Row(mainAxisAlignment: pw.MainAxisAlignment.spaceBetween, children: [
            pw.Column(crossAxisAlignment: pw.CrossAxisAlignment.start, children: [
              pw.Text('STB BANK', style: pw.TextStyle(font: fontBold, fontSize: 22, color: PdfColors.white)),
              pw.SizedBox(height: 4),
              pw.Text('Rapport Financier Mensuel', style: pw.TextStyle(font: font, fontSize: 12, color: PdfColors.grey300)),
              pw.Text('$mois $annee', style: pw.TextStyle(font: fontBold, fontSize: 14, color: PdfColors.yellow)),
            ]),
            pw.Column(crossAxisAlignment: pw.CrossAxisAlignment.end, children: [
              pw.Text('$prenom $nom', style: pw.TextStyle(font: fontBold, fontSize: 13, color: PdfColors.white)),
              pw.Text(poste, style: pw.TextStyle(font: font, fontSize: 10, color: PdfColors.grey300)),
              pw.SizedBox(height: 8),
              pw.Container(
                padding: const pw.EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: pw.BoxDecoration(color: PdfColors.white, borderRadius: pw.BorderRadius.circular(8)),
                child: pw.Text('Score: $score/100 — $scoreLabel', style: pw.TextStyle(font: fontBold, fontSize: 10, color: stbBlue)),
              ),
            ]),
          ]),
        ),
        pw.SizedBox(height: 20),
        // Stats
        pw.Text('Resume du Mois', style: pw.TextStyle(font: fontBold, fontSize: 14, color: stbDark)),
        pw.SizedBox(height: 12),
        pw.Row(children: [
          _statCard(fontBold, font, 'Solde Compte', '${solde.toStringAsFixed(3)} TND', stbBlue, PdfColors.blue50),
          pw.SizedBox(width: 8),
          _statCard(fontBold, font, 'Entrees', '+${totalIn.toStringAsFixed(3)} TND', stbGreen, PdfColors.green50),
          pw.SizedBox(width: 8),
          _statCard(fontBold, font, 'Sorties', '-${totalOut.toStringAsFixed(3)} TND', PdfColor.fromInt(0xFFDC2626), PdfColors.red50),
          pw.SizedBox(width: 8),
          _statCard(fontBold, font, 'Flux Net', '${netFlow >= 0 ? '+' : ''}${netFlow.toStringAsFixed(3)} TND',
            netFlow >= 0 ? stbGreen : PdfColor.fromInt(0xFFDC2626), netFlow >= 0 ? PdfColors.green50 : PdfColors.red50),
        ]),
        pw.SizedBox(height: 20),
        // RH
        pw.Text('Situation RH', style: pw.TextStyle(font: fontBold, fontSize: 14, color: stbDark)),
        pw.SizedBox(height: 12),
        pw.Container(
          padding: const pw.EdgeInsets.all(16),
          decoration: pw.BoxDecoration(color: stbLightBg, borderRadius: pw.BorderRadius.circular(12)),
          child: pw.Row(children: [
            _rhItem(fontBold, font, 'Salaire Brut', '${salaireBase.toStringAsFixed(3)} TND'),
            pw.SizedBox(width: 12),
            _rhItem(fontBold, font, 'Salaire Net est.', '${(salaireBase * 0.75).toStringAsFixed(3)} TND'),
            pw.SizedBox(width: 12),
            _rhItem(fontBold, font, 'Conges Dispo', '$soldeConges jours'),
            pw.SizedBox(width: 12),
            _rhItem(fontBold, font, 'Prime', prime > 0 ? '${prime.toStringAsFixed(3)} TND' : '—'),
            pw.SizedBox(width: 12),
            _rhItem(fontBold, font, 'Credits', '${creditsEnCours.toStringAsFixed(3)} TND'),
          ]),
        ),
        pw.SizedBox(height: 20),
        // Categories
        pw.Text('Top Categories de Depenses (${transactions.length} transactions)', style: pw.TextStyle(font: fontBold, fontSize: 14, color: stbDark)),
        pw.SizedBox(height: 12),
        if (top5.isEmpty)
          pw.Text('Aucune transaction ce mois.', style: pw.TextStyle(font: font, color: stbGray))
        else
          pw.Column(children: top5.asMap().entries.map((e) {
            final pct = totalOut > 0 ? (e.value.value / totalOut * 100) : 0.0;
            return pw.Padding(padding: const pw.EdgeInsets.only(bottom: 8), child: pw.Row(children: [
              pw.Container(width: 10, height: 10, decoration: pw.BoxDecoration(color: colors[e.key % colors.length], shape: pw.BoxShape.circle)),
              pw.SizedBox(width: 8),
              pw.Expanded(child: pw.Text(e.value.key, style: pw.TextStyle(font: font, fontSize: 10))),
              pw.SizedBox(width: 8),
              pw.Container(width: 100, height: 8, decoration: pw.BoxDecoration(color: PdfColors.grey200, borderRadius: pw.BorderRadius.circular(4)),
                child: pw.Row(children: [
                  pw.Container(width: 100 * (pct / 100).clamp(0, 1).toDouble(), decoration: pw.BoxDecoration(color: colors[e.key % colors.length], borderRadius: pw.BorderRadius.circular(4)))
                ])),
              pw.SizedBox(width: 8),
              pw.Text('${e.value.value.toStringAsFixed(1)} TND (${pct.toStringAsFixed(0)}%)', style: pw.TextStyle(font: fontBold, fontSize: 9, color: stbGray)),
            ]));
          }).toList()),
        pw.SizedBox(height: 20),
        // AI Tip
        pw.Container(
          padding: const pw.EdgeInsets.all(16),
          decoration: pw.BoxDecoration(color: PdfColor.fromInt(0xFFFFF7ED), borderRadius: pw.BorderRadius.circular(12)),
          child: pw.Column(crossAxisAlignment: pw.CrossAxisAlignment.start, children: [
            pw.Text('Conseil STB Copilot AI', style: pw.TextStyle(font: fontBold, fontSize: 12, color: stbGold)),
            pw.SizedBox(height: 8),
            pw.Text(tip, style: pw.TextStyle(font: font, fontSize: 10, color: stbDark, lineSpacing: 4)),
          ]),
        ),
        pw.SizedBox(height: 16),
        pw.Divider(color: PdfColors.grey300),
        pw.Row(mainAxisAlignment: pw.MainAxisAlignment.spaceBetween, children: [
          pw.Text('Genere par STB Copilot AI · ${now.day}/${now.month}/${now.year}', style: pw.TextStyle(font: font, fontSize: 8, color: stbGray)),
          pw.Text('Societe Tunisienne de Banque — STB Bank', style: pw.TextStyle(font: font, fontSize: 8, color: stbGray)),
        ]),
      ],
    ));

    final dir = await getApplicationDocumentsDirectory();
    final filePath = '${dir.path}/STB_Rapport_${mois}_$annee.pdf';
    await File(filePath).writeAsBytes(await pdf.save());
    return filePath;
  }

  static Future<void> openReport(String path) async => OpenFile.open(path);
}
