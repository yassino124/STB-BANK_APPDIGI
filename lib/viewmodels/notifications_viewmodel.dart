import 'package:flutter/material.dart';
import '../models/banking_models.dart';
import '../data/repositories/banking_repository.dart';
import '../services/auth_api_service.dart';
import '../services/polling_service.dart';

class NotificationsViewModel extends ChangeNotifier {
  final BankingRepository _repo;
  final PollingService _pollingService = PollingService.instance;
  
  NotificationsViewModel({BankingRepository? repo})
      : _repo = repo ?? BankingRepository.instance {
    // Start auto-refresh for notifications
    _pollingService.addCallback(_handlePoll);
  }

  List<NotificationItem> _items = [];
  bool _isLoading = true;

  List<NotificationItem> get items => List.unmodifiable(_items);
  bool get isLoading => _isLoading;
  int get unreadCount => _items.where((n) => !n.isRead).length;

  Future<void> load() async {
    _isLoading = true;
    notifyListeners();
    
    final res = await AuthApiService.getMyNotifications();
    if (res.isSuccess && res.data != null) {
      _items = res.data!.map((d) => NotificationItem(
        id: d['_id'] ?? 'unknown',
        title: d['title'] ?? 'Notification',
        body: d['body'] ?? d['message'] ?? '',
        category: _mapCategory(d['type']),
        isRead: d['isRead'] ?? false,
        timestamp: d['createdAt'] != null ? DateTime.parse(d['createdAt']) : DateTime.now(),
      )).toList();
    }
    
    _isLoading = false;
    notifyListeners();
  }

  NotificationCategory _mapCategory(String? type) {
    if (type == 'HR_REQUEST') return NotificationCategory.account;
    if (type == 'TRANSACTION') return NotificationCategory.transaction;
    if (type == 'SYSTEM') return NotificationCategory.security;
    return NotificationCategory.promotion;
  }

  void dismiss(String id) async {
    _items.removeWhere((n) => n.id == id);
    notifyListeners();
    await AuthApiService.markNotificationRead(id);
  }

  void markRead(String id) async {
    final idx = _items.indexWhere((n) => n.id == id);
    if (idx != -1) {
      _items[idx].isRead = true;
      notifyListeners();
      await AuthApiService.markNotificationRead(id);
    }
  }

  void clearAll() {
    _items.clear();
    notifyListeners();
  }
  
  /// Handle polling callback
  void _handlePoll() {
    if (!_isLoading) {
      debugPrint('🔔 Notifications auto-refreshing...');
      load();
    }
  }
  
  @override
  void dispose() {
    _pollingService.removeCallback(_handlePoll);
    super.dispose();
  }
}
