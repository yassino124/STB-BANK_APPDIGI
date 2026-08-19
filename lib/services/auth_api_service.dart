import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:onesignal_flutter/onesignal_flutter.dart';

/// STB API Service — connects to NestJS backend on localhost:3000
class AuthApiService {
  // ── Config ──────────────────────────────────────────────────────
  // On iOS Simulator: use 127.0.0.1
  // On Android Emulator: use 10.0.2.2
  // On real device: use your machine's local IP (e.g. 192.168.x.x)
  static const String _baseUrl = 'https://stb-backend-blno.onrender.com/api/v1'; // ☁️ Production
  //static const String _baseUrl = 'https://stb-backend-blno.onrender.com/api/v1'; // ☁️ Render Cloud

  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static bool _isRefreshing = false;
  static Completer<String?>? _refreshCompleter;

  // ── Employee ID Cache (avoids N+1 getMe() calls) ─────────────────────────
  static String? _cachedEmployeeId;

  static Future<String?> _getEmployeeId() async {
    if (_cachedEmployeeId != null) return _cachedEmployeeId;
    try {
      // Try from local cache first (instant)
      final cached = await getProfile();
      if (cached != null) {
        final profileData = jsonDecode(cached) as Map<String, dynamic>;
        _cachedEmployeeId = profileData['_id'] as String?;
        if (_cachedEmployeeId != null) return _cachedEmployeeId;
      }
      // Fallback: live API
      final res = await getMe();
      if (res.isSuccess && res.data != null) {
        _cachedEmployeeId = res.data!['_id'] as String?;
      }
    } catch (_) {}
    return _cachedEmployeeId;
  }

  static void clearEmployeeIdCache() => _cachedEmployeeId = null;

  // ── Token Storage ────────────────────────────────────────────────
  static Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _storage.write(key: 'access_token', value: accessToken);
    await _storage.write(key: 'refresh_token', value: refreshToken);
  }

  static Future<String?> getAccessToken() =>
      _storage.read(key: 'access_token');
  static Future<String?> getRefreshToken() async {
    final val = await _storage.read(key: 'refresh_token');
    if (val == null || val.isEmpty) return null;
    return val;
  }

  static Future<bool> isLoggedIn() async {
    final access = await getAccessToken();
    final refresh = await getRefreshToken();
    return access != null && access.isNotEmpty && refresh != null;
  }

  static Future<void> saveMatricule(String matricule) async {
      await _storage.write(key: 'matricule', value: matricule);
      OneSignal.login(matricule); // 🔔 Lier le téléphone au matricule
  }
  static Future<String?> getMatricule() => _storage.read(key: 'matricule');

  static Future<void> saveBiometricEnabled(bool enabled) =>
      _storage.write(key: 'biometric_enabled', value: enabled.toString());
  static Future<bool> getBiometricEnabled() async {
    final val = await _storage.read(key: 'biometric_enabled');
    return val == 'true';
  }

  static Future<void> saveDeviceUUID(String uuid) =>
      _storage.write(key: 'device_uuid', value: uuid);
  static Future<String?> getDeviceUUID() => _storage.read(key: 'device_uuid');

  static Future<void> clearAll() async {
    _cachedEmployeeId = null;
    await _storage.deleteAll();
    OneSignal.logout(); // 🔔 Déconnecter des notifications
  }

  static Future<void> saveProfile(String profileJson) =>

      _storage.write(key: 'employee_profile', value: profileJson);
  static Future<String?> getProfile() => _storage.read(key: 'employee_profile');
  static Future<void> clearProfile() => _storage.delete(key: 'employee_profile');

  // ── Helper ───────────────────────────────────────────────────────
  static Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

  static Future<Map<String, String>> authenticatedHeaders() async {
    final token = await getAccessToken();
    if (token == null || token.isEmpty) return _headers;
    return {
      ..._headers,
      'Authorization': 'Bearer $token',
    };
  }

  static Future<void> _clearSession() async {
    await clearAll();
  }

  static ApiResult<T> _handleResponse<T>(
    http.Response response,
    T Function(dynamic) parser,
  ) {
    final rawBody = jsonDecode(response.body);
    final isWrapped = rawBody is Map<String, dynamic> && rawBody.containsKey('success') && rawBody.containsKey('data');
    final body = isWrapped ? rawBody['data'] : rawBody;

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return ApiResult.success(parser(body));
    }
    final message = (rawBody is Map<String, dynamic> ? rawBody['message'] : null) ??
        'Erreur ${response.statusCode}';
    return ApiResult.error(
        message is List ? message.first.toString() : message.toString());
  }

  static Future<ApiResult<T>> _authRequest<T>(
    Future<http.Response> Function() requestFn,
    T Function(dynamic) parser,
  ) async {
    try {
      var response = await requestFn();
      if (response.statusCode == 401) {
        final newToken = await _tryRefreshToken();
        if (newToken != null) {
          response = await requestFn();
        } else {
          await _clearSession();
          return ApiResult.error('Session expirée. Veuillez vous reconnecter.');
        }
      }
      return _handleResponse(response, parser);
    } catch (e) {
      return ApiResult.error(_networkError(e));
    }
  }

  static Future<String?> _tryRefreshToken() async {
    if (_isRefreshing) {
      if (_refreshCompleter != null) return await _refreshCompleter!.future;
      return null;
    }
    _isRefreshing = true;
    _refreshCompleter = Completer<String?>();
    try {
      final refresh = await getRefreshToken();
      if (refresh == null) {
        _refreshCompleter!.complete(null);
        return null;
      }
      final result = await refreshToken();
      if (result.isSuccess && result.data != null) {
        await saveTokens(
          accessToken: result.data!['accessToken'] as String,
          refreshToken: result.data!['refreshToken'] as String,
        );
        _refreshCompleter!.complete(result.data!['accessToken'] as String);
        return result.data!['accessToken'] as String;
      }
      _refreshCompleter!.complete(null);
      return null;
    } catch (e) {
      _refreshCompleter!.complete(null);
      return null;
    } finally {
      _isRefreshing = false;
      _refreshCompleter = null;
    }
  }

  // ── LOGIN — Password ─────────────────────────────────────────────
  static Future<ApiResult<LoginResponse>> login({
    required String matricule,
    required String password,
    String? deviceUUID,
    String? deviceName,
    String platform = 'iOS',
  }) async {
    final body = {
      'matricule': matricule,
      'password': password,
      if (deviceUUID != null) 'deviceUUID': deviceUUID,
      if (deviceName != null) 'deviceName': deviceName,
      'platform': platform,
    };

    // Try up to 2 times to handle Render cold-start (sleeps after inactivity)
    for (int attempt = 1; attempt <= 2; attempt++) {
      try {
        final response = await http
            .post(
              Uri.parse('$_baseUrl/auth/login'),
              headers: _headers,
              body: jsonEncode(body),
            )
            .timeout(const Duration(seconds: 45)); // ⬆️ 45s for Render wake-up

        return _handleResponse(response, (b) => LoginResponse.fromJson(b as Map<String, dynamic>));
      } catch (e) {
        final errStr = e.toString();
        final isTimeout = errStr.contains('TimeoutException');
        final isSocket = errStr.contains('SocketException') || errStr.contains('Connection refused');

        // On timeout (Render cold-start), retry once automatically
        if (isTimeout && attempt < 2) continue;
        if (isSocket) return ApiResult.error('Connexion impossible. Vérifiez votre réseau.');
        if (isTimeout) return ApiResult.error('Le serveur démarre, réessayez dans quelques secondes.');
        return ApiResult.error(_networkError(e));
      }
    }
    return const ApiResult.error('Impossible de joindre le serveur.');
  }

  // ── LOGIN — Biometric ────────────────────────────────────────────
  static Future<ApiResult<LoginResponse>> biometricLogin({
    required String matricule,
    required String deviceUUID,
    required String biometricType, // 'FACE_ID' | 'FINGERPRINT'
  }) async {
    final body = {
      'matricule': matricule,
      'deviceUUID': deviceUUID,
      'biometricType': biometricType,
    };

    for (int attempt = 1; attempt <= 2; attempt++) {
      try {
        final response = await http
            .post(
              Uri.parse('$_baseUrl/auth/login/biometric'),
              headers: _headers,
              body: jsonEncode(body),
            )
            .timeout(const Duration(seconds: 45));

        return _handleResponse(response, (b) => LoginResponse.fromJson(b as Map<String, dynamic>));
      } catch (e) {
        final errStr = e.toString();
        final isTimeout = errStr.contains('TimeoutException');
        final isSocket = errStr.contains('SocketException') || errStr.contains('Connection refused');

        if (isTimeout && attempt < 2) continue;
        if (isSocket) return ApiResult.error('Connexion impossible. Vérifiez votre réseau.');
        if (isTimeout) return ApiResult.error('Le serveur démarre, réessayez dans quelques secondes.');
        return ApiResult.error(_networkError(e));
      }
    }
    return const ApiResult.error('Impossible de joindre le serveur.');
  }

  // ── LOGIN — PIN ──────────────────────────────────────────────────
  static Future<ApiResult<LoginResponse>> pinLogin({
    required String matricule,
    required String pin,
    String? deviceUUID,
  }) async {
    final body = {
      'matricule': matricule,
      'pin': pin,
      if (deviceUUID != null) 'deviceUUID': deviceUUID,
    };

    for (int attempt = 1; attempt <= 2; attempt++) {
      try {
        final response = await http
            .post(
              Uri.parse('$_baseUrl/auth/login/pin'),
              headers: _headers,
              body: jsonEncode(body),
            )
            .timeout(const Duration(seconds: 45));

        return _handleResponse(response, (b) => LoginResponse.fromJson(b as Map<String, dynamic>));
      } catch (e) {
        final errStr = e.toString();
        final isTimeout = errStr.contains('TimeoutException');
        final isSocket = errStr.contains('SocketException') || errStr.contains('Connection refused');

        if (isTimeout && attempt < 2) continue;
        if (isSocket) return ApiResult.error('Connexion impossible. Vérifiez votre réseau.');
        if (isTimeout) return ApiResult.error('Le serveur démarre, réessayez dans quelques secondes.');
        return ApiResult.error(_networkError(e));
      }
    }
    return const ApiResult.error('Impossible de joindre le serveur.');
  }

  // ── REFRESH TOKEN ────────────────────────────────────────────────
  static Future<ApiResult<Map<String, String>>> refreshToken() async {
    try {
      final refresh = await getRefreshToken();
      if (refresh == null) return ApiResult.error('Aucun refresh token.');

      final response = await http
          .post(
            Uri.parse('$_baseUrl/auth/token/refresh'),
            headers: _headers,
            body: jsonEncode({'refreshToken': refresh}),
          )
          .timeout(const Duration(seconds: 10));

      return _handleResponse(response, (body) {
        return {
          'accessToken': body['accessToken'] as String,
          'refreshToken': body['refreshToken'] as String,
        };
      });
    } catch (e) {
      return ApiResult.error(_networkError(e));
    }
  }

  // ── LOGOUT ───────────────────────────────────────────────────────
  static Future<void> logout() async {
    try {
      final headers = await authenticatedHeaders();
      await http
          .post(Uri.parse('$_baseUrl/auth/logout'), headers: headers)
          .timeout(const Duration(seconds: 5));
    } catch (_) {}
    await clearAll();
  }

  // ── ACTIVATION — Step 1: Request OTP ───────────────────────────
  static Future<ApiResult<Map<String, dynamic>>> requestActivation({
    required String matricule,
    required String cin,
    required String dateNaissance, // ISO: '1990-05-15'
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse('$_baseUrl/auth/activate/request'),
            headers: _headers,
            body: jsonEncode({
              'matricule': matricule,
              'cin': cin,
              'dateNaissance': dateNaissance,
            }),
          )
          .timeout(const Duration(seconds: 10));
      return _handleResponse(response, (b) => b);
    } catch (e) {
      return ApiResult.error(_networkError(e));
    }
  }

  // ── ACTIVATION — Step 2: Verify OTP ────────────────────────────
  static Future<ApiResult<Map<String, dynamic>>> verifyOtp({
    required String matricule,
    required String code,
    String purpose = 'ACTIVATION',
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse('$_baseUrl/auth/activate/verify-otp'),
            headers: _headers,
            body: jsonEncode({
              'matricule': matricule,
              'code': code,
              'purpose': purpose,
            }),
          )
          .timeout(const Duration(seconds: 10));
      return _handleResponse(response, (b) => b);
    } catch (e) {
      return ApiResult.error(_networkError(e));
    }
  }

  // ── ACTIVATION — Step 3: Set Password ──────────────────────────
  static Future<ApiResult<Map<String, dynamic>>> setPassword({
    required String matricule,
    required String password,
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse('$_baseUrl/auth/activate/set-password'),
            headers: _headers,
            body: jsonEncode({
              'matricule': matricule,
              'password': password,
            }),
          )
          .timeout(const Duration(seconds: 10));
      return _handleResponse(response, (b) => b);
    } catch (e) {
      return ApiResult.error(_networkError(e));
    }
  }

  // ── ACTIVATION — Step 4: Set PIN ────────────────────────────────
  static Future<ApiResult<Map<String, dynamic>>> setPin({
    required String matricule,
    required String pin,
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse('$_baseUrl/auth/activate/set-pin'),
            headers: _headers,
            body: jsonEncode({
              'matricule': matricule,
              'pin': pin,
            }),
          )
          .timeout(const Duration(seconds: 10));
      return _handleResponse(response, (b) => b);
    } catch (e) {
      return ApiResult.error(_networkError(e));
    }
  }

  // ── ACTIVATION — Step 5: Enable Biometrics ──────────────────────
  static Future<ApiResult<Map<String, dynamic>>> enableBiometrics({
    required String accessToken,
    required String type, // 'FACE_ID' | 'FINGERPRINT' | 'BOTH'
    required String deviceUUID,
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse('$_baseUrl/auth/activate/enable-biometrics'),
            headers: {
              ..._headers,
              'Authorization': 'Bearer $accessToken',
            },
            body: jsonEncode({
              'type': type,
              'deviceUUID': deviceUUID,
            }),
          )
          .timeout(const Duration(seconds: 10));
      return _handleResponse(response, (b) => b);
    } catch (e) {
      return ApiResult.error(_networkError(e));
    }
  }

  // ── FORGOT PASSWORD ─────────────────────────────────────────────
  static Future<ApiResult<Map<String, dynamic>>> forgotPassword({
    required String matricule,
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse('$_baseUrl/auth/password/forgot'),
            headers: _headers,
            body: jsonEncode({'matricule': matricule}),
          )
          .timeout(const Duration(seconds: 10));
      return _handleResponse(response, (b) => b);
    } catch (e) {
      return ApiResult.error(_networkError(e));
    }
  }

  // ── RESET PASSWORD ──────────────────────────────────────────────
  static Future<ApiResult<Map<String, dynamic>>> resetPassword({
    required String matricule,
    required String otpCode,
    required String newPassword,
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse('$_baseUrl/auth/password/reset'),
            headers: _headers,
            body: jsonEncode({
              'matricule': matricule,
              'otpCode': otpCode,
              'newPassword': newPassword,
            }),
          )
          .timeout(const Duration(seconds: 10));
      return _handleResponse(response, (b) => b);
    } catch (e) {
      return ApiResult.error(_networkError(e));
    }
  }

  // ── GET ME ───────────────────────────────────────────────────────
  static Future<ApiResult<Map<String, dynamic>>> getMe() async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/auth/me'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) => body as Map<String, dynamic>,
    );
  }

  static Future<ApiResult<List<dynamic>>> getActivityTimeline() async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/employees/my/activity?limit=15'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) => body as List<dynamic>,
    );
  }

  // ── COPILOT ──────────────────────────────────────────────────────
  static Future<ApiResult<String>> sendCopilotMessage(String message, {Map<String, dynamic>? userContext}) async {
    return _authRequest(
      () async => http.post(
        Uri.parse('$_baseUrl/copilot/chat'),
        headers: await authenticatedHeaders(),
        body: jsonEncode({
          'message': message,
          if (userContext != null) 'context': userContext,
        }),
      ).timeout(const Duration(seconds: 20)),
      (body) => body['reply'] as String,
    );
  }

  // ── HR REQUESTS ──────────────────────────────────────────────────
  static Future<ApiResult<Map<String, dynamic>>> createHRRequest({
    required String type, // 'CONGE', 'AVANCE', 'DOCUMENT', 'CARTE'
    required Map<String, dynamic> payload,
  }) async {
    return _authRequest(
      () async => http.post(Uri.parse('$_baseUrl/requests'), headers: await authenticatedHeaders(), body: jsonEncode({'type': type, 'payload': payload})).timeout(const Duration(seconds: 10)),
      (body) => body,
    );
  }

  static Future<ApiResult<List<dynamic>>> getMyHRRequests() async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/requests/my-requests'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) => body as List<dynamic>,
    );
  }

  static Future<ApiResult<Map<String, dynamic>>> submitRequest(
    String endpoint, 
    Map<String, dynamic> payload
  ) async {
    return _authRequest(
      () async => http.post(Uri.parse('$_baseUrl/$endpoint'), headers: await authenticatedHeaders(), body: jsonEncode(payload)).timeout(const Duration(seconds: 10)),
      (b) => b,
    );
  }

  // ── DIRECTORY ────────────────────────────────────────────────────────────
  static Future<ApiResult<List<dynamic>>> searchDirectory(String query) async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/employees/directory/search?q=$query'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) => body as List<dynamic>,
    );
  }

  // ── PAYROLL ──────────────────────────────────────────────────────────────
  static Future<ApiResult<List<dynamic>>> getMyPayrolls() async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/payroll/my'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) => body as List<dynamic>,
    );
  }

  // ── CREDITS ──────────────────────────────────────────────────────────────
  static Future<ApiResult<List<dynamic>>> getMyCredits() async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/credits/my'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) => body as List<dynamic>,
    );
  }

  static Future<ApiResult<Map<String, dynamic>>> getCreditAmortizationTable(String creditId) async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/credits/$creditId/amortization-table'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) => body as Map<String, dynamic>,
    );
  }

  static Future<ApiResult<Map<String, dynamic>>> getCreditPaymentHistory(String creditId) async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/credits/$creditId/payment-history'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) => body as Map<String, dynamic>,
    );
  }

  static Future<ApiResult<Map<String, dynamic>>> calculateEarlyRepayment(String creditId) async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/credits/$creditId/early-repayment-calculation'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) => body as Map<String, dynamic>,
    );
  }

  static Future<ApiResult<Map<String, dynamic>>> performEarlyRepayment(String creditId, String pin) async {
    return _authRequest(
      () async => http.post(
        Uri.parse('$_baseUrl/credits/$creditId/early-repayment'),
        headers: await authenticatedHeaders(),
        body: jsonEncode({'pin': pin}),
      ).timeout(const Duration(seconds: 15)),
      (body) => body as Map<String, dynamic>,
    );
  }

  static Future<ApiResult<Map<String, dynamic>>> retryLatePayment(String creditId, String pin) async {
    return _authRequest(
      () async => http.post(
        Uri.parse('$_baseUrl/credits/$creditId/retry-late-payment'),
        headers: await authenticatedHeaders(),
        body: jsonEncode({'pin': pin}),
      ).timeout(const Duration(seconds: 15)),
      (body) => body as Map<String, dynamic>,
    );
  }

  // ── AVANCES ──────────────────────────────────────────────────────────────
  static Future<ApiResult<List<dynamic>>> getMyAvances() async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/avances/my'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) => body as List<dynamic>,
    );
  }

  static Future<ApiResult<Map<String, dynamic>>> createAvance({
    required String type, // 'SALAIRE'
    required double montant,
    String? motif,
  }) async {
    return _authRequest(
      () async => http.post(
        Uri.parse('$_baseUrl/avances'),
        headers: await authenticatedHeaders(),
        body: jsonEncode({
          'type': type,
          'montant': montant,
          if (motif != null) 'motif': motif,
        }),
      ).timeout(const Duration(seconds: 10)),
      (body) => body as Map<String, dynamic>,
    );
  }

  // ── PRIMES ───────────────────────────────────────────────────────────────

  static Future<ApiResult<List<dynamic>>> getMyPrimes() async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/primes/my'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) => body as List<dynamic>,
    );
  }

  static Future<ApiResult<Map<String, dynamic>>> createPrime({
    required String type, // 'PRIME' | 'PRIME_AID'
    required double montant,
    String? description,
  }) async {
    return _authRequest(
      () async => http.post(
        Uri.parse('$_baseUrl/primes'),
        headers: await authenticatedHeaders(),
        body: jsonEncode({
          'type': type,
          'montant': montant,
          'description': description ?? 'Demande de prime',
        }),
      ).timeout(const Duration(seconds: 10)),
      (body) => body as Map<String, dynamic>,
    );
  }

  // ── CONGÉS ───────────────────────────────────────────────────────────────
  static Future<ApiResult<List<dynamic>>> getMyConges() async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/leave/my'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) => body as List<dynamic>,
    );
  }

  static Future<ApiResult<Map<String, dynamic>>> getMyLeaveBalance() async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/leave/my-balance'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) => body as Map<String, dynamic>,
    );
  }

  static Future<ApiResult<Map<String, dynamic>>> createConge({
    required String type, // 'REPOS' | 'MALADIE' | 'MARIAGE' | 'NAISSANCE' | 'DECES' | 'PELERINAGE' | 'SANS_SOLDE'
    required String startDate, // ISO format: '2026-08-01'
    required String endDate,   // ISO format: '2026-08-07'
    String? motif,
  }) async {
    return _authRequest(
      () async => http.post(
        Uri.parse('$_baseUrl/leave'),
        headers: await authenticatedHeaders(),
        body: jsonEncode({
          'type': type,
          'dateDebut': startDate,
          'dateFin': endDate,
          if (motif != null) 'motif': motif,
        }),
      ).timeout(const Duration(seconds: 10)),
      (body) => body as Map<String, dynamic>,
    );
  }

  // ── MANAGER: Pending Approvals (congés en attente de l'équipe) ──
  static Future<ApiResult<List<dynamic>>> getPendingApprovals() async {
    return _authRequest(
      () async => http.get(
        Uri.parse('$_baseUrl/leave/pending-team'),
        headers: await authenticatedHeaders(),
      ).timeout(const Duration(seconds: 10)),
      (body) {
        // Backend returns { success: true, data: [...] }
        if (body is Map && body['data'] != null) {
          return body['data'] as List<dynamic>;
        }
        return body as List<dynamic>;
      },
    );
  }

  // ── MANAGER: Team Requests ──────────────────────────────────────
  static Future<ApiResult<List<dynamic>>> getTeamRequests() async {
    return _authRequest(
      () async => http.get(
        Uri.parse('$_baseUrl/leave/my-team'),
        headers: await authenticatedHeaders(),
      ).timeout(const Duration(seconds: 10)),
      (body) => body as List<dynamic>,
    );
  }

  // ── MANAGER: Approve/Reject Leave via /leave/:id/manager-approve or /manager-reject ──
  static Future<ApiResult<Map<String, dynamic>>> handleLeaveApproval({
    required String leaveRequestId,
    required String decision, // 'APPROVED' | 'REJECTED'
    String? commentaire,
  }) async {
    if (decision == 'APPROVED') {
      return _authRequest(
        () async => http.post(
          Uri.parse('$_baseUrl/leave/$leaveRequestId/manager-approve'),
          headers: await authenticatedHeaders(),
          body: jsonEncode({'commentaire': commentaire ?? ''}),
        ).timeout(const Duration(seconds: 10)),
        (body) => body as Map<String, dynamic>,
      );
    } else {
      return _authRequest(
        () async => http.post(
          Uri.parse('$_baseUrl/leave/$leaveRequestId/manager-reject'),
          headers: await authenticatedHeaders(),
          body: jsonEncode({'commentaire': commentaire ?? 'Refusé par le manager'}),
        ).timeout(const Duration(seconds: 10)),
        (body) => body as Map<String, dynamic>,
      );
    }
  }

  // ── ABSENCE: Create Absence Request ──────────────────────────────
  static Future<ApiResult<Map<String, dynamic>>> createAbsence({
    required String type, // 'ABSENCE' | 'RETARD' | 'DELEGATION' | 'MISSION'
    required String startDate,
    required String endDate,
    required double nombreHeures,
    String? motif,
  }) async {
    return _authRequest(
      () async => http.post(
        Uri.parse('$_baseUrl/absences'),
        headers: await authenticatedHeaders(),
        body: jsonEncode({
          'type': type,
          'dateDebut': startDate,
          'dateFin': endDate,
          'nombreHeures': nombreHeures,
          if (motif != null) 'motif': motif,
        }),
      ).timeout(const Duration(seconds: 10)),
      (body) => body as Map<String, dynamic>,
    );
  }

  // ── ABSENCE: Get My Absences ──────────────────────────────────────
  static Future<ApiResult<List<dynamic>>> getMyAbsences() async {
    return _authRequest(
      () async => http.get(
        Uri.parse('$_baseUrl/absences/my'),
        headers: await authenticatedHeaders(),
      ).timeout(const Duration(seconds: 10)),
      (body) => body as List<dynamic>,
    );
  }

  // ── ABSENCE: Get Pending for Manager ──────────────────────────────
  static Future<ApiResult<List<dynamic>>> getPendingAbsencesForManager() async {
    return _authRequest(
      () async => http.get(
        Uri.parse('$_baseUrl/absences/pending-manager'),
        headers: await authenticatedHeaders(),
      ).timeout(const Duration(seconds: 10)),
      (body) => body as List<dynamic>,
    );
  }

  // ── ABSENCE: Handle Manager Approval ──────────────────────────────
  static Future<ApiResult<Map<String, dynamic>>> handleAbsenceManagerApproval({
    required String absenceId,
    required String decision, // 'APPROVED' | 'REJECTED'
    String? commentaire,
  }) async {
    return _authRequest(
      () async => http.patch(
        Uri.parse('$_baseUrl/absences/$absenceId/handle-manager'),
        headers: await authenticatedHeaders(),
        body: jsonEncode({
          'decision': decision,
          if (commentaire != null) 'commentaire': commentaire,
        }),
      ).timeout(const Duration(seconds: 10)),
      (body) => body as Map<String, dynamic>,
    );
  }

  // ── ABSENCE: Cancel Absence ───────────────────────────────────────
  static Future<ApiResult<Map<String, dynamic>>> cancelAbsence(String absenceId) async {
    return _authRequest(
      () async => http.patch(
        Uri.parse('$_baseUrl/absences/$absenceId/cancel'),
        headers: await authenticatedHeaders(),
      ).timeout(const Duration(seconds: 10)),
      (body) => body as Map<String, dynamic>,
    );
  }

  // ── FINANCE PROFILE ──────────────────────────────────────────────────────
  static Future<ApiResult<Map<String, dynamic>>> getFinanceProfile(String employeeId) async {
    return _authRequest(
      () async => http.get(
        Uri.parse('$_baseUrl/employees/$employeeId/finance-profile'),
        headers: await authenticatedHeaders(),
      ).timeout(const Duration(seconds: 10)),
      (body) => body as Map<String, dynamic>,
    );
  }

  // ── DOCUMENTS ────────────────────────────────────────────────────────────
  static Future<List<dynamic>> getDocuments() async {
    final employeeId = await _getEmployeeId();
    if (employeeId == null) throw Exception('Employee ID not found');
    
    final response = await http.get(
      Uri.parse('$_baseUrl/documents/employee/$employeeId'),
      headers: await authenticatedHeaders(),
    ).timeout(const Duration(seconds: 10));
    
    if (response.statusCode == 200) {
      final body = jsonDecode(response.body);
      return body as List<dynamic>;
    }
    throw Exception('Failed to load documents');
  }



  static Future<Map<String, dynamic>> getDocumentStats() async {
    final employeeId = await _getEmployeeId();
    if (employeeId == null) throw Exception('Employee ID not found');
    
    final response = await http.get(
      Uri.parse('$_baseUrl/documents/employee/$employeeId/stats'),
      headers: await authenticatedHeaders(),
    ).timeout(const Duration(seconds: 10));
    
    if (response.statusCode == 200) {
      final body = jsonDecode(response.body);
      return body as Map<String, dynamic>;
    }
    throw Exception('Failed to load stats');
  }

  static Future<ApiResult<List<dynamic>>> getMyDocuments() async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/documents/my'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) => body as List<dynamic>,
    );
  }

  // ── TRANSACTIONS ──────────────────────────────────────────────────
  static Future<ApiResult<List<dynamic>>> getMyTransactions() async {
    try {
      final employeeId = await _getEmployeeId();
      if (employeeId == null) return const ApiResult.error('Employee ID not found');
      final response = await http.get(
        Uri.parse('$_baseUrl/transactions/my?employeeId=$employeeId'),
        headers: await authenticatedHeaders(),
      ).timeout(const Duration(seconds: 10));
      return _handleResponse(response, (body) {
        if (body == null) return <dynamic>[];
        if (body is Map<String, dynamic>) {
          if (body.containsKey('data')) {
            final nd = body['data'];
            if (nd is List) return nd;
            if (nd is Map<String, dynamic> && nd.containsKey('data')) {
              final txs = nd['data'];
              if (txs is List) return txs;
            }
          }
          return <dynamic>[];
        }
        if (body is List) return body;
        return <dynamic>[];
      });
    } catch (e) {
      debugPrint('Error in getMyTransactions: $e');
      return ApiResult.error('Erreur de connexion');
    }
  }

  static Future<ApiResult<Map<String, dynamic>>> createTransfer({required String toMatricule, required double montant, required String motif}) async {
    // Get employee ID from profile
    final profile = await getMe();
    if (!profile.isSuccess || profile.data == null) {
      return ApiResult.error('Failed to get profile');
    }
    
    final fromEmployeeId = profile.data!['_id'] as String?;
    if (fromEmployeeId == null) {
      return ApiResult.error('Employee ID not found');
    }
    
    return _authRequest(
      () async => http.post(
        Uri.parse('$_baseUrl/transactions/transfer'),
        headers: await authenticatedHeaders(),
        body: jsonEncode({
          'toMatricule': toMatricule,
          'montant': montant,
          'motif': motif,
          'fromEmployeeId': fromEmployeeId, // Add employee ID
        }),
      ).timeout(const Duration(seconds: 10)),
      (b) => b,
    );
  }
  // ── BANKING ─────────────────────────────────────────────────────────
  static Future<ApiResult<List<dynamic>>> getMyAccounts() async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/accounts/my'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) => body as List<dynamic>,
    );
  }

  static Future<ApiResult<List<dynamic>>> getMyCards() async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/cards/my'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) => body as List<dynamic>,
    );
  }

  // ── NOTIFICATIONS ──────────────────────────────────────────────────
  static Future<ApiResult<List<dynamic>>> getMyNotifications() async {
    final employeeId = await _getEmployeeId();
    if (employeeId == null) return const ApiResult.error('Employee ID not found');
    return _authRequest(
      () async => http.get(
        Uri.parse('$_baseUrl/notifications/my?employeeId=$employeeId'),
        headers: await authenticatedHeaders(),
      ).timeout(const Duration(seconds: 10)),
      (body) {
        if (body is Map && body['data'] is List) return body['data'] as List<dynamic>;
        return body as List<dynamic>;
      },
    );
  }

  static Future<ApiResult<int>> getUnreadCount() async {
    final employeeId = await _getEmployeeId();
    if (employeeId == null) return const ApiResult.error('Employee ID not found');
    return _authRequest(
      () async => http.get(
        Uri.parse('$_baseUrl/notifications/unread-count?employeeId=$employeeId'),
        headers: await authenticatedHeaders(),
      ).timeout(const Duration(seconds: 10)),
      (body) => body['count'] as int,
    );
  }

  static Future<ApiResult<void>> markNotificationRead(String id) async {
    return _authRequest(
      () async => http.patch(
        Uri.parse('$_baseUrl/notifications/$id/read'),
        headers: await authenticatedHeaders(),
      ).timeout(const Duration(seconds: 10)),
      (_) => null,
    );
  }

  // ── INVESTMENTS ─────────────────────────────────────────────────
  static Future<ApiResult<List<dynamic>>> getInvestments() async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/investments'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) => body as List<dynamic>,
    );
  }

  // ── BUDGETS ─────────────────────────────────────────────────────
  static Future<ApiResult<List<dynamic>>> getBudgets() async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/budgets'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) => body as List<dynamic>,
    );
  }

  static Future<ApiResult<dynamic>> createBudget(Map<String, dynamic> data) async {
    return _authRequest(
      () async => http.post(
        Uri.parse('$_baseUrl/budgets'),
        headers: await authenticatedHeaders(),
        body: jsonEncode(data),
      ).timeout(const Duration(seconds: 10)),
      (body) => body,
    );
  }

  static Future<ApiResult<dynamic>> updateBudgetProgress(String budgetId, double amount, bool isSavings) async {
    return _authRequest(
      () async => http.patch(
        Uri.parse('$_baseUrl/budgets/$budgetId/progress'),
        headers: await authenticatedHeaders(),
        body: jsonEncode({'amount': amount, 'isSavings': isSavings}),
      ).timeout(const Duration(seconds: 10)),
      (body) => body,
    );
  }


  // ── QR PAYMENTS ─────────────────────────────────────────────────
  static Future<ApiResult<List<dynamic>>> getQrPayments() async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/qr-payments'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) => body as List<dynamic>,
    );
  }

  // ── BILLS ───────────────────────────────────────────────────────
  static Future<ApiResult<List<dynamic>>> getBills() async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/bills'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) => body as List<dynamic>,
    );
  }

  // ── RECHARGE ────────────────────────────────────────────────────
  static Future<ApiResult<List<dynamic>>> getRecharges() async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/recharges'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) => body as List<dynamic>,
    );
  }

  static Future<ApiResult<dynamic>> submitRecharge(String operatorId, String phone, double amount) async {
    return _authRequest(
      () async => http.post(
        Uri.parse('$_baseUrl/recharges'),
        headers: await authenticatedHeaders().then((h) => {...h, 'Content-Type': 'application/json'}),
        body: jsonEncode({'operator': operatorId, 'phoneNumber': phone, 'amount': amount}),
      ).timeout(const Duration(seconds: 10)),
      (body) => body,
    );
  }

  // ── PAY BILL ────────────────────────────────────────────────────
  static Future<ApiResult<dynamic>> payBill(
    String billType,
    String reference,
    double amount,
    String billerName,
  ) async {
    return _authRequest(
      () async => http.post(
        Uri.parse('$_baseUrl/bills'),
        headers: await authenticatedHeaders().then((h) => {...h, 'Content-Type': 'application/json'}),
        body: jsonEncode({
          'billType': billType,
          'reference': reference,
          'amount': amount,
          'billerName': billerName,
        }),
      ).timeout(const Duration(seconds: 10)),
      (body) => body,
    );
  }

  // ── MESSAGES ────────────────────────────────────────────────────
  static Future<ApiResult<List<dynamic>>> getConversations() async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/conversations'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) => body as List<dynamic>,
    );
  }

  static Future<ApiResult<List<dynamic>>> getMessages(String conversationId) async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/messages/conversation/$conversationId'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) => body as List<dynamic>,
    );
  }

  // ── Helpers ──────────────────────────────────────────────────────
  static String _networkError(Object e) {
    final s = e.toString();
    if (s.contains('SocketException') || s.contains('Connection refused')) {
      return 'Connexion impossible. Vérifiez votre réseau.';
    }
    if (s.contains('TimeoutException')) return 'Le serveur démarre, réessayez dans quelques secondes.';
    return 'Erreur réseau inattendue.';
  }

  /// 🏓 Ping backend to wake it up (Render free-tier cold start)
  /// Uses /health/ping (simple liveness check, no DB query).
  /// Call this early (e.g. on app launch / login screen init) so the server
  /// is already warm by the time the user taps "Se connecter".
  static Future<void> pingServer() async {
    try {
      await http
          .get(Uri.parse('$_baseUrl/health/ping'))
          .timeout(const Duration(seconds: 60));
    } catch (_) {
      // Silent — fire-and-forget, we don't surface errors here
    }
  }

  // ── AMICALE ────────────────────────────────────────────────────────
  static Future<ApiResult<List<dynamic>>> getAmicaleOffers() async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/amicale/active'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) => body as List<dynamic>,
    );
  }

  // ── CHEQUES ────────────────────────────────────────────────────────
  static Future<ApiResult<List<dynamic>>> getMyCheques() async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/cheques/my'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) => body as List<dynamic>,
    );
  }

  static Future<ApiResult<dynamic>> submitChequeRequest(String type) async {
    return _authRequest(
      () async => http.post(
        Uri.parse('$_baseUrl/cheques/my'),
        headers: await authenticatedHeaders().then((h) => {...h, 'Content-Type': 'application/json'}),
        body: jsonEncode({'type': type}),
      ).timeout(const Duration(seconds: 10)),
      (body) => body,
    );
  }

  // ── TICKETS ────────────────────────────────────────────────────────
  static Future<ApiResult<dynamic>> createTicket({
    required String type,
    required String subject,
    required String message,
    required String priority,
  }) async {
    final employeeId = await _getEmployeeId();
    return _authRequest(
      () async {
        final headers = await authenticatedHeaders();
        final body = jsonEncode({
          'type': type,
          'subject': subject,
          'message': message,
          'priority': priority,
          if (employeeId != null) 'employeeId': employeeId,
        });
        return http.post(
          Uri.parse('$_baseUrl/tickets'),
          headers: {...headers, 'Content-Type': 'application/json'},
          body: body,
        ).timeout(const Duration(seconds: 10));
      },
      (body) => body,
    );
  }

  static Future<ApiResult<List<dynamic>>> getMyTickets() async {
    return _authRequest(
      () async {
        final headers = await authenticatedHeaders();
        final empId = await _getEmployeeId();
        final queryParam = empId != null ? '?employeeId=$empId' : '';
        final url = Uri.parse('$_baseUrl/tickets/my$queryParam');
        return http.get(url, headers: headers).timeout(const Duration(seconds: 10));
      },
      (body) {
        if (body is List) return body;
        if (body is Map) {
          if (body.containsKey('data') && body['data'] is List) return body['data'];
          if (body.containsKey('tickets') && body['tickets'] is List) return body['tickets'];
          if (body.containsKey('items') && body['items'] is List) return body['items'];
          if (body.containsKey('results') && body['results'] is List) return body['results'];
          // If it's a map but has no list, maybe the map itself contains the array in another key
          for (var value in body.values) {
            if (value is List) return value;
          }
        }
        return <dynamic>[];
      },
    );
  }

  static Future<ApiResult<Map<String, dynamic>>> getTicketDetails(String id) async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/tickets/$id'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) {
        if (body is Map<String, dynamic>) {
          if (body.containsKey('data') && body['data'] is Map<String, dynamic>) {
            return body['data'] as Map<String, dynamic>;
          }
          return body;
        }
        return <String, dynamic>{};
      },
    );
  }

  static Future<ApiResult<List<dynamic>>> getTicketMessages(String ticketId) async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/tickets/$ticketId/messages'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) {
        if (body is List) return body;
        if (body is Map) {
          if (body.containsKey('data') && body['data'] is List) return body['data'];
          if (body.containsKey('messages') && body['messages'] is List) return body['messages'];
          if (body.containsKey('items') && body['items'] is List) return body['items'];
          if (body.containsKey('results') && body['results'] is List) return body['results'];
          for (var value in body.values) {
            if (value is List) return value;
          }
        }
        return <dynamic>[];
      },
    );
  }

  static Future<ApiResult<dynamic>> sendTicketMessage({
    required String ticketId,
    required String message,
    String senderType = 'EMPLOYEE',
  }) async {
    return _authRequest(
      () async => http.post(
        Uri.parse('$_baseUrl/tickets/$ticketId/messages'),
        headers: await authenticatedHeaders().then((h) => {...h, 'Content-Type': 'application/json'}),
        body: jsonEncode({
          'message': message,
          'senderType': senderType,
        }),
      ).timeout(const Duration(seconds: 10)),
      (body) => body,
    );
  }

  // ── Documents ────────────────────────────────────────────────────

  static Future<ApiResult<List<dynamic>>> fetchMyDocuments() async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/documents/my'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) {
        if (body is List) return body;
        if (body is Map && body.containsKey('data') && body['data'] is List) return body['data'];
        return <dynamic>[];
      },
    );
  }

  static Future<ApiResult<dynamic>> markDocumentAsRead(String docId) async {
    return _authRequest(
      () async => http.patch(Uri.parse('$_baseUrl/documents/$docId/read'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) => body,
    );
  }

  static Future<ApiResult<List<int>>> downloadDocument(String docId) async {
    try {
      final headers = await authenticatedHeaders();
      final response = await http.get(
        Uri.parse('$_baseUrl/documents/$docId/download'),
        headers: headers,
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        return ApiResult.success(response.bodyBytes);
      } else {
        return ApiResult.error('Erreur ${response.statusCode}: ${response.body}');
      }
    } catch (e) {
      return ApiResult.error('Erreur téléchargement: $e');
    }
  }

  static Future<ApiResult<int>> getUnreadTicketsCount() async {
    return _authRequest(
      () async => http.get(Uri.parse('$_baseUrl/tickets/my/unread-count'), headers: await authenticatedHeaders()).timeout(const Duration(seconds: 10)),
      (body) => (body as Map<String, dynamic>)['count'] as int,
    );
  }

  // ── SEND TEST NOTIFICATION (OneSignal) ───────────────────────────
  static Future<ApiResult<dynamic>> sendTestNotification({
    String? employeeId,
    required String title,
    required String body,
    String type = 'SYSTEM',
  }) async {
    return _authRequest(
      () async => http.post(
        Uri.parse('$_baseUrl/notifications/send'),
        headers: await authenticatedHeaders().then((h) => {...h, 'Content-Type': 'application/json'}),
        body: jsonEncode({
          if (employeeId != null && employeeId.isNotEmpty) 'employeeId': employeeId,
          'title': title,
          'body': body,
          'type': type,
        }),
      ).timeout(const Duration(seconds: 15)),
      (body) => body,
    );
  }
}

// ── Models ────────────────────────────────────────────────────────

class ApiResult<T> {
  final T? data;
  final String? error;
  bool get isSuccess => error == null;

  const ApiResult.success(this.data) : error = null;
  const ApiResult.error(this.error) : data = null;
}

class LoginResponse {
  final String accessToken;
  final String refreshToken;
  final Map<String, dynamic>? employee;
  final bool isNewDevice;
  final bool requiresDeviceVerification;

  LoginResponse({
    required this.accessToken,
    required this.refreshToken,
    this.employee,
    this.isNewDevice = false,
    this.requiresDeviceVerification = false,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      accessToken: json['accessToken'] as String? ?? '',
      refreshToken: json['refreshToken'] as String? ?? '',
      employee: json['employee'] as Map<String, dynamic>?,
      isNewDevice: json['isNewDevice'] as bool? ?? false,
      requiresDeviceVerification:
          json['requiresDeviceVerification'] as bool? ?? false,
    );
  }
}

