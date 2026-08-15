import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

/// STB AI Service — routes all AI calls through the NestJS backend (Gemini-powered).
/// The Gemini API key is stored securely on the server, never in the app.
class AiApiService {
  // Points to the same backend as AuthApiService
  //static const String _baseUrl = 'https://stb-backend-blno.onrender.com/api/v1';
  static const String _baseUrl = 'https://stb-backend-blno.onrender.com/api/v1'; // ☁️ Production

  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static Future<Map<String, String>> _authHeaders() async {
    final token = await _storage.read(key: 'accessToken');
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<String> generateResponse(String promptContext, String userMessage) async {
    try {
      final headers = await _authHeaders();
      final response = await http.post(
        Uri.parse('$_baseUrl/copilot/chat'),
        headers: headers,
        body: jsonEncode({'message': userMessage}),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return data['reply'] as String? ?? '🤖 Réponse vide du serveur.';
      }
      return '🤖 Oups, une erreur est survenue. Code: ${response.statusCode}';
    } catch (e) {
      return '🤖 Erreur de connexion au STB Copilot. Vérifiez votre connexion internet.';
    }
  }

  static Future<String> analyzeSpending(String spendingData) async {
    try {
      final headers = await _authHeaders();
      final response = await http.post(
        Uri.parse('$_baseUrl/copilot/analyze-spending'),
        headers: headers,
        body: jsonEncode({'spendingData': spendingData}),
      ).timeout(const Duration(seconds: 40));

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return data['reply'] as String? ?? '🤖 Oups, je ne parviens pas à analyser vos dépenses.';
      }
      return '🤖 Oups, je ne parviens pas à analyser vos dépenses pour le moment.';
    } catch (e) {
      return '🤖 Erreur de connexion au moteur IA.';
    }
  }

  static Future<String> getPredictiveInsight(double balance) async {
    try {
      final headers = await _authHeaders();
      final response = await http.post(
        Uri.parse('$_baseUrl/copilot/predictive-insight'),
        headers: headers,
        body: jsonEncode({'balance': balance}),
      ).timeout(const Duration(seconds: 25));

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return data['reply'] as String? ?? '💡 Gérez bien votre budget ce mois-ci !';
      }
      return '💡 Gérez bien votre budget ce mois-ci !';
    } catch (e) {
      return '💡 Gérez bien votre budget ce mois-ci !';
    }
  }

  static Future<String> processVoiceCommand(String userSpokenText) async {
    try {
      final headers = await _authHeaders();
      final response = await http.post(
        Uri.parse('$_baseUrl/copilot/voice-command'),
        headers: headers,
        body: jsonEncode({'text': userSpokenText}),
      ).timeout(const Duration(seconds: 20));

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return data['reply'] as String? ?? '🤖 Commande traitée.';
      }
      return '🤖 Je n\'ai pas pu traiter votre demande. Veuillez réessayer.';
    } catch (e) {
      return '🤖 Je n\'ai pas pu traiter votre demande. Veuillez réessayer.';
    }
  }

  static Future<String> analyzeBillText(String extractedText) async {
    try {
      final headers = await _authHeaders();
      final response = await http.post(
        Uri.parse('$_baseUrl/copilot/analyze-bill'),
        headers: headers,
        body: jsonEncode({'text': extractedText}),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200 || response.statusCode == 201) {
        // Return raw JSON string — caller parses it
        return response.body;
      }
      return '{"type":"Inconnu","amount":"0","merchant":"Inconnu","date":null,"advice":"Je n\'ai pas pu analyser ce document 🤖"}';
    } catch (e) {
      return '{"type":"Erreur","amount":"0","merchant":"Service indisponible","date":null,"advice":"Vérifiez votre connexion internet 🤖"}';
    }
  }

  static Future<String> planLeave(int remainingDays, String userRequest) async {
    try {
      final headers = await _authHeaders();
      final response = await http.post(
        Uri.parse('$_baseUrl/copilot/plan-leave'),
        headers: headers,
        body: jsonEncode({'remainingDays': remainingDays, 'userRequest': userRequest}),
      ).timeout(const Duration(seconds: 60));

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return data['reply'] as String? ?? 'CONSEIL: Désolé, je ne peux pas générer un plan.\n---\nRÉSUMÉ: Erreur IA.\n---\nLETTRE: Non disponible.';
      }
      return 'CONSEIL: Désolé, je ne peux pas générer un plan.\n---\nRÉSUMÉ: Erreur IA.\n---\nLETTRE: Non disponible.';
    } catch (e) {
      return 'CONSEIL: Erreur de connexion.\n---\nRÉSUMÉ: Service IA indisponible.\n---\nLETTRE: Non disponible.';
    }
  }
}
