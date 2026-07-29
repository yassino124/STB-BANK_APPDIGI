import 'dart:convert';
import 'package:http/http.dart' as http;

class OllamaApiService {
  // Use 127.0.0.1 for iOS Simulator, 10.0.2.2 for Android Emulator.
  // For physical devices on the same Wi-Fi, replace with the Mac's IP (e.g., 192.168.1.50)
  static const String _ollamaUrl = 'http://127.0.0.1:11434';
  
  // The model you want to use. Make sure you have pulled it: `ollama run llama3`
  static const String _model = 'llama3';

  static Future<String> generateResponse(String promptContext, String userMessage) async {
    final url = Uri.parse('$_ollamaUrl/api/generate');

    final fullPrompt = '''
Tu es le STB Copilot AI, l'assistant financier RH personnel de la STB Bank.
Contexte:
$promptContext

L'utilisateur dit: "$userMessage"

Réponds directement, de manière concise et amicale en français. Utilise des emojis.
''';

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'model': _model,
          'prompt': fullPrompt,
          'stream': false,
        }),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['response'] as String;
      } else {
        return '🤖 Oups, je ne parviens pas à joindre Ollama. Code erreur: ${response.statusCode}';
      }
    } catch (e) {
      return '🤖 Erreur de connexion au serveur Ollama local. Vérifiez qu\'il est bien lancé (ollama run $_model). Détail: $e';
    }
  }

  static Future<String> analyzeSpending(String spendingData) async {
    final url = Uri.parse('$_ollamaUrl/api/generate');

    final fullPrompt = '''
Tu es le STB Copilot AI, l'assistant financier RH personnel de la STB Bank.
Voici un résumé des dépenses du collaborateur ce mois-ci :
$spendingData

Ton rôle est d'analyser ces dépenses et de donner 2 phrases de conseils financiers hyper personnalisés, professionnels mais amicaux (avec des emojis). Dis-lui exactement où il dépense trop et comment économiser.
''';

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'model': _model,
          'prompt': fullPrompt,
          'stream': false,
        }),
      ).timeout(const Duration(seconds: 40));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['response'] as String;
      } else {
        return '🤖 Oups, je ne parviens pas à analyser vos dépenses pour le moment.';
      }
    } catch (e) {
      return '🤖 Erreur de connexion au moteur IA. Assurez-vous qu\'Ollama est lancé.';
    }
  }

  static Future<String> getPredictiveInsight(double balance) async {
    final url = Uri.parse('$_ollamaUrl/api/generate');
    
    final day = DateTime.now().day;
    final fullPrompt = '''
Tu es le STB Copilot AI, l'assistant financier RH personnel de la STB Bank.
Nous sommes le $day du mois, et le solde actuel du collaborateur est de ${balance.toStringAsFixed(2)} TND.

Génère UNE SEULE PHRASE courte, amicale, et ultra-prédictive (avec 1 ou 2 emojis).
Exemple si on est en fin de mois (ex: le 25) : "Attention, la facture internet arrive bientôt, gardez un peu de côté !"
Exemple si le solde est bas : "Votre solde est un peu bas pour cette période, évitez les gros achats."
Exemple si on est en début de mois : "Le salaire est tombé ! C'est le moment idéal pour mettre 50 TND de côté."

Ne dis rien d'autre que la phrase prédictive.
''';

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'model': _model,
          'prompt': fullPrompt,
          'stream': false,
        }),
      ).timeout(const Duration(seconds: 25));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['response'] as String;
      } else {
        return '🤖 Oups, je ne parviens pas à prédire vos dépenses pour le moment.';
      }
    } catch (e) {
      return '🤖 Erreur de connexion IA. Vérifiez que Ollama tourne.';
    }
  }

  static Future<String> processVoiceCommand(String userSpokenText) async {
    final url = Uri.parse('$_ollamaUrl/api/generate');
    final fullPrompt = '''
Tu es le STB Copilot AI, l'assistant bancaire vocal de la STB Bank.
L'employé a dit (en voix): "$userSpokenText"

Analyse la commande et réponds de manière TRÈS COURTE (1-2 phrases max) et amicale avec des emojis.
Si c'est une demande de virement: confirme les détails et dis que tu vas exécuter.
Si c'est une question sur le solde: réponds avec une valeur fictive illustrative.
Si c'est une demande de congé: dis que la demande est enregistrée.
Si tu ne comprends pas: demande une précision gentiment.
Ne réponds qu'en français.
''';
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'model': _model, 'prompt': fullPrompt, 'stream': false}),
      ).timeout(const Duration(seconds: 20));
      if (response.statusCode == 200) {
        return (jsonDecode(response.body)['response'] as String).trim();
      }
      return '🤖 Je n\'ai pas pu traiter votre demande. Veuillez réessayer.';
    } catch (e) {
      return '🤖 Erreur IA. Vérifiez qu\'Ollama est lancé.';
    }
  }

  static Future<String> analyzeBillText(String extractedText) async {
    final url = Uri.parse('$_ollamaUrl/api/generate');
    final fullPrompt = '''
Tu es le STB Copilot AI, l'assistant financier de la STB Bank.
Voici le texte extrait d'un document ou d'une facture scanné :
---
$extractedText
---
Analyse ce texte et réponds en JSON avec exactement ce format:
{"type": "type de document (ex: Facture STEG, Reçu Restaurant, Facture Internet...)", "amount": "montant en TND (ex: 45.500)", "merchant": "nom du marchand ou fournisseur", "date": "date si trouvée sinon null", "advice": "conseil court et amical (1 phrase avec emoji)"}

Ne réponds qu'avec le JSON, rien d'autre.
''';
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'model': _model, 'prompt': fullPrompt, 'stream': false}),
      ).timeout(const Duration(seconds: 30));
      if (response.statusCode == 200) {
        return (jsonDecode(response.body)['response'] as String).trim();
      }
      return '{"type":"Inconnu","amount":"0","merchant":"Inconnu","date":null,"advice":"Je n\'ai pas pu analyser ce document 🤖"}';
    } catch (e) {
      return '{"type":"Erreur","amount":"0","merchant":"Ollama non disponible","date":null,"advice":"Vérifiez qu\'Ollama est lancé 🤖"}';
    }
  }

  static Future<String> planLeave(int remainingDays, String userRequest) async {
    final url = Uri.parse('$_ollamaUrl/api/generate');
    final now = DateTime.now();
    final fullPrompt = '''
Tu es le STB Copilot AI, conseiller RH intelligent de la STB Bank.
Nous sommes le ${now.day}/${now.month}/${now.year}.
Le collaborateur a ${remainingDays} jours de congé restants.

Sa demande : "$userRequest"

Réponds en 3 parties clairement séparées par "---":
1. CONSEIL: Propose les meilleures dates optimales pour maximiser le repos (en incluant les weekends si possible). Sois précis avec les dates.
2. RÉSUMÉ: Un résumé en 1 phrase de ta recommandation.
3. LETTRE: Rédige une lettre de demande de congé formelle et professionnelle en français, prête à soumettre au responsable. Inclure l'objet, le corps et une formule de politesse.

Commence directement par CONSEIL:
''';
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'model': _model, 'prompt': fullPrompt, 'stream': false}),
      ).timeout(const Duration(seconds: 60));
      if (response.statusCode == 200) {
        return (jsonDecode(response.body)['response'] as String).trim();
      }
      return 'CONSEIL: Désolé, je ne peux pas générer un plan pour le moment.\n---\nRÉSUMÉ: Erreur IA.\n---\nLETTRE: Non disponible.';
    } catch (e) {
      return 'CONSEIL: Erreur de connexion Ollama. Vérifiez qu\'il est lancé.\n---\nRÉSUMÉ: Service IA indisponible.\n---\nLETTRE: Non disponible.';
    }
  }
}
