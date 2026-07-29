import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';

enum WsEvent { newNotification, newMessage, transactionUpdate }

class WebSocketService {
  static final WebSocketService _instance = WebSocketService._internal();
  factory WebSocketService() => _instance;
  WebSocketService._internal();

  static const _url = 'ws://127.0.0.1:3000';
  static const _heartbeatInterval = Duration(seconds: 30);

  dynamic _channel;
  final StreamController<Map<String, dynamic>> _eventController = StreamController<Map<String, dynamic>>.broadcast();
  final List<String> _subscribedChannels = [];
  bool _connected = false;
  Timer? _heartbeatTimer;
  Timer? _reconnectTimer;

  bool get isConnected => _connected;
  Stream<Map<String, dynamic>> get eventStream => _eventController.stream;

  Future<void> connect() async {
    if (_connected) return;
    if (kIsWeb) {
      try {
        await _connectWeb();
      } catch (e) {
        debugPrint('WS connect error: $e');
      }
    } else {
      try {
        await _connectNative();
      } catch (e) {
        debugPrint('WS connect error: $e');
      }
    }
  }

  Future<void> _connectWeb() async {
    try {
      final ws = WebSocket.connect(_url);
      _channel = await ws;
      _onOpen();
    } catch (e) {
      _scheduleReconnect();
    }
  }

  Future<void> _connectNative() async {
    try {
      final ws = await WebSocket.connect(_url);
      _channel = ws;
      _onOpen();
      ws.listen((data) => _onMessage(data), onError: (_) => _onClose(), onDone: _onClose);
    } catch (e) {
      _scheduleReconnect();
    }
  }

  void _onOpen() {
    _connected = true;
    _reconnectTimer?.cancel();
    _startHeartbeat();
    for (final ch in _subscribedChannels) {
      _sendRaw(jsonEncode({'action': 'subscribe', 'channel': ch}));
    }
  }

  void _onMessage(dynamic data) {
    try {
      final msg = jsonDecode(data) as Map<String, dynamic>;
      _eventController.add(msg);
    } catch (e) {
      debugPrint('WS message parse error: $e');
    }
  }

  void _onClose() {
    _connected = false;
    _heartbeatTimer?.cancel();
    _scheduleReconnect();
  }

  void _scheduleReconnect() {
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(const Duration(seconds: 5), connect);
  }

  void _startHeartbeat() {
    _heartbeatTimer?.cancel();
    _heartbeatTimer = Timer.periodic(_heartbeatInterval, (_) {
      if (_connected) _sendRaw(jsonEncode({'action': 'ping'}));
    });
  }

  void _sendRaw(String payload) {
    try {
      if (_channel == null) return;
      (_channel).add(payload);
    } catch (e) {
      debugPrint('WS send error: $e');
    }
  }

  Future<void> send(Map<String, dynamic> data) async {
    _sendRaw(jsonEncode(data));
  }

  Future<void> subscribeToChannel(String channel) async {
    if (!_subscribedChannels.contains(channel)) {
      _subscribedChannels.add(channel);
    }
    _sendRaw(jsonEncode({'action': 'subscribe', 'channel': channel}));
  }

  Future<void> unsubscribeFromChannel(String channel) async {
    _subscribedChannels.remove(channel);
    _sendRaw(jsonEncode({'action': 'unsubscribe', 'channel': channel}));
  }

  Future<void> disconnect() async {
    _heartbeatTimer?.cancel();
    _reconnectTimer?.cancel();
    try {
      if (_channel != null) {
        await (_channel.close());
      }
    } catch (e) {
      debugPrint('WS disconnect error: $e');
    }
    _channel = null;
    _connected = false;
    _subscribedChannels.clear();
  }
}
