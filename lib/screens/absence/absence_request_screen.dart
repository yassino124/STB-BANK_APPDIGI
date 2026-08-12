import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_api_service.dart';
import '../../core/navigation/app_router.dart';

class AbsenceRequestScreen extends StatefulWidget {
  const AbsenceRequestScreen({super.key});

  @override
  State<AbsenceRequestScreen> createState() => _AbsenceRequestScreenState();
}

class _AbsenceRequestScreenState extends State<AbsenceRequestScreen> {
  final _formKey = GlobalKey<FormState>();
  String _selectedType = 'ABSENCE';
  DateTime _dateDebut = DateTime.now();
  DateTime _dateFin = DateTime.now();
  final _heureDebutCtrl = TextEditingController(text: '08:00');
  final _heureFinCtrl = TextEditingController(text: '10:00');
  final _motifCtrl = TextEditingController();
  final _nombreHeuresCtrl = TextEditingController(text: '2');
  bool _loading = false;

  final _types = [
    {'value': 'ABSENCE', 'label': 'Absence', 'icon': Icons.calendar_today, 'color': AppTheme.electricBlue as Color},
    {'value': 'RETARD', 'label': 'Retard', 'icon': Icons.access_time, 'color': AppTheme.coralRed as Color},
    {'value': 'DELEGATION', 'label': 'Délégation', 'icon': Icons.call_split, 'color': AppTheme.emerald as Color},
    {'value': 'MISSION', 'label': 'Mission', 'icon': Icons.flight, 'color': AppTheme.amber as Color},
  ];

  @override
  void dispose() {
    _heureDebutCtrl.dispose();
    _heureFinCtrl.dispose();
    _motifCtrl.dispose();
    _nombreHeuresCtrl.dispose();
    super.dispose();
  }

  Future<void> _selectDate(BuildContext context, bool isStart) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: isStart ? _dateDebut : _dateFin,
      firstDate: DateTime.now().subtract(const Duration(days: 30)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      locale: const Locale('fr', 'FR'),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: AppTheme.electricBlue,
              onPrimary: Colors.white,
              onSurface: AppTheme.textPrimaryLight,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        if (isStart) {
          _dateDebut = picked;
          _dateFin = picked;
        } else {
          _dateFin = picked;
        }
      });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);
    try {
      final res = await AuthApiService.createAbsence(
        type: _selectedType,
        startDate: _dateDebut.toIso8601String().split('T').first,
        endDate: _dateFin.toIso8601String().split('T').first,
        nombreHeures: double.parse(_nombreHeuresCtrl.text),
        motif: _motifCtrl.text.trim().isEmpty ? null : _motifCtrl.text.trim(),
      );

      if (res.isSuccess && res.data != null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Demande d\'absence soumise avec succès'),
              backgroundColor: AppTheme.emerald,
            ),
          );
          Navigator.pop(context, true);
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(res.error ?? 'Erreur lors de la soumission'),
              backgroundColor: AppTheme.coralRed,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur: $e'),
            backgroundColor: AppTheme.coralRed,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = context.watch<AppProvider>();
    final dk = p.themeMode == ThemeMode.dark;
    final fg = dk ? AppTheme.textPrimaryDark : AppTheme.textPrimaryLight;
    final mt = dk ? AppTheme.textMutedDark : AppTheme.textMutedLight;
    final cd = Theme.of(context).cardColor;
    final bd = dk ? Colors.white.withValues(alpha: 0.06) : const Color(0xFFE2E8F0);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Nouvelle Absence'),
        centerTitle: true,
        elevation: 0,
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        foregroundColor: fg,
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Type selector
              Text('Type d\'absence', style: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _types.map((t) {
                  final isSelected = _selectedType == t['value'];
                  return GestureDetector(
                    onTap: () => setState(() => _selectedType = t['value'] as String),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      decoration: BoxDecoration(
                        color: isSelected ? (t['color'] as Color).withValues(alpha: 0.15) : cd,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? (t['color'] as Color) : bd,
                          width: isSelected ? 2 : 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(t['icon'] as IconData, size: 18, color: isSelected ? (t['color'] as Color) : mt),
                          const SizedBox(width: 8),
                          Text(
                            t['label'] as String,
                            style: TextStyle(
                              color: isSelected ? (t['color'] as Color) : fg,
                              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),

              const SizedBox(height: 20),

              // Date range
              Text('Période', style: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => _selectDate(context, true),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: cd,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: bd),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.calendar_today_outlined, size: 18, color: AppTheme.electricBlue),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                '${_dateDebut.day}/${_dateDebut.month}/${_dateDebut.year}',
                                style: TextStyle(color: fg, fontSize: 13, fontWeight: FontWeight.w600),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 12),
                    child: Icon(Icons.arrow_forward_ios, size: 16, color: mt),
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => _selectDate(context, false),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: cd,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: bd),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.calendar_today_outlined, size: 18, color: AppTheme.electricBlue),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                '${_dateFin.day}/${_dateFin.month}/${_dateFin.year}',
                                style: TextStyle(color: fg, fontSize: 13, fontWeight: FontWeight.w600),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 20),

              // Hours
              Text('Nombre d\'heures (max 2H)', style: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              TextFormField(
                controller: _nombreHeuresCtrl,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  hintText: 'Ex: 1.5',
                  hintStyle: TextStyle(color: mt),
                  filled: true,
                  fillColor: cd,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: bd)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: bd)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppTheme.electricBlue)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                ),
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Champ requis';
                  final hours = double.tryParse(v);
                  if (hours == null) return 'Nombre invalide';
                  if (hours > 2) return 'Maximum 2 heures par mois';
                  if (hours <= 0) return 'Doit être supérieur à 0';
                  return null;
                },
              ),

              const SizedBox(height: 20),

              // Motif
              Text('Motif (optionnel)', style: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              TextFormField(
                controller: _motifCtrl,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'Expliquez votre absence...',
                  hintStyle: TextStyle(color: mt),
                  filled: true,
                  fillColor: cd,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: bd)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: bd)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppTheme.electricBlue)),
                  contentPadding: const EdgeInsets.all(12),
                ),
              ),

              const SizedBox(height: 24),

              // Submit button
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _loading ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.electricBlue,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 4,
                  ),
                  child: _loading
                      ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Soumettre la demande', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                ),
              ),

              const SizedBox(height: 16),

              // Info card
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.electricBlue.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.electricBlue.withValues(alpha: 0.2)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, size: 18, color: AppTheme.electricBlue),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Une absence ne peut pas dépasser 2 heures par mois. Elle ne déduit pas de solde de congés.',
                        style: TextStyle(color: (fg as Color).withValues(alpha: 0.7), fontSize: 12),
                      ),
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