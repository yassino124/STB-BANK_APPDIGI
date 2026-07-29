import 'dart:async';
import 'package:flutter/foundation.dart';

/// Service to poll for updates at regular intervals
/// Automatically refreshes notifications, transactions, and balance
class PollingService {
  static final PollingService instance = PollingService._();
  PollingService._();

  Timer? _timer;
  final List<VoidCallback> _callbacks = [];
  bool _isPolling = false;

  /// Duration between polls (default: 10 seconds)
  Duration pollInterval = const Duration(seconds: 10);

  /// Start polling
  void start() {
    if (_isPolling) return;
    
    _isPolling = true;
    debugPrint('🔄 Polling service started (interval: ${pollInterval.inSeconds}s)');
    
    _timer = Timer.periodic(pollInterval, (timer) {
      debugPrint('🔄 Polling for updates...');
      _notifyCallbacks();
    });
  }

  /// Stop polling
  void stop() {
    _timer?.cancel();
    _timer = null;
    _isPolling = false;
    debugPrint('⏹️ Polling service stopped');
  }

  /// Add a callback to be called on each poll
  void addCallback(VoidCallback callback) {
    if (!_callbacks.contains(callback)) {
      _callbacks.add(callback);
      debugPrint('➕ Added polling callback (total: ${_callbacks.length})');
    }
  }

  /// Remove a callback
  void removeCallback(VoidCallback callback) {
    _callbacks.remove(callback);
    debugPrint('➖ Removed polling callback (remaining: ${_callbacks.length})');
  }

  /// Notify all callbacks
  void _notifyCallbacks() {
    for (var callback in _callbacks) {
      try {
        callback();
      } catch (e) {
        debugPrint('❌ Error in polling callback: $e');
      }
    }
  }

  /// Change poll interval
  void setInterval(Duration interval) {
    pollInterval = interval;
    if (_isPolling) {
      stop();
      start();
    }
  }

  /// Check if polling is active
  bool get isActive => _isPolling;

  /// Get current interval
  Duration get currentInterval => pollInterval;

  /// Dispose service
  void dispose() {
    stop();
    _callbacks.clear();
  }
}
