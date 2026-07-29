import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../theme/app_theme.dart';

class TransactionHistoryCard extends StatelessWidget {
  final Map<String, dynamic> transaction;
  final bool isDark;

  const TransactionHistoryCard({
    super.key,
    required this.transaction,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final type = transaction['type'] as String? ?? 'UNKNOWN';
    final montant = (transaction['montant'] as num?)?.toDouble() ?? 0.0;
    final date = transaction['date'] as String?;
    final description = transaction['description'] as String? ?? 'Transaction';
    final status = transaction['status'] as String? ?? 'COMPLETED';
    
    // Determine icon and color based on type
    IconData icon;
    Color iconColor;
    String prefix;
    
    switch (type.toUpperCase()) {
      case 'TRANSFER':
      case 'DEBIT':
        icon = Icons.arrow_upward_rounded;
        iconColor = Colors.orange;
        prefix = '-';
        break;
      case 'CREDIT':
      case 'SALARY':
      case 'PRIME':
        icon = Icons.arrow_downward_rounded;
        iconColor = AppTheme.emerald;
        prefix = '+';
        break;
      default:
        icon = Icons.swap_horiz_rounded;
        iconColor = AppTheme.electricBlue;
        prefix = '';
    }

    final formattedDate = date != null 
        ? DateFormat('dd MMM yyyy, HH:mm').format(DateTime.parse(date))
        : 'N/A';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark 
              ? Colors.white.withOpacity(0.08) 
              : Colors.black.withOpacity(0.04),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          // Icon
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.12),
              shape: BoxShape.circle,
              border: Border.all(
                color: iconColor.withOpacity(0.3),
                width: 1.5,
              ),
            ),
            child: Icon(icon, color: iconColor, size: 22),
          ),
          const SizedBox(width: 14),
          
          // Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  description,
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.onSurface,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  formattedDate,
                  style: TextStyle(
                    color: isDark 
                        ? const Color(0xFF94A3B8) 
                        : const Color(0xFF64748B),
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          
          // Amount
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '$prefix${montant.toStringAsFixed(2)} DT',
                style: TextStyle(
                  color: iconColor,
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.3,
                ),
              ),
              const SizedBox(height: 2),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: status == 'COMPLETED' 
                      ? AppTheme.emerald.withOpacity(0.12)
                      : Colors.orange.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  status,
                  style: TextStyle(
                    color: status == 'COMPLETED' 
                        ? AppTheme.emerald 
                        : Colors.orange,
                    fontSize: 9,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.3,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
