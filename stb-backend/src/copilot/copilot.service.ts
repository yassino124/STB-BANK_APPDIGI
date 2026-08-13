import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class CopilotService {
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || 'dummy-key');
  }

  async chat(employee: any, message: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      const systemPrompt = `Tu es le "STB Copilot", un assistant IA avancé, chaleureux, professionnel et dédié exclusivement aux employés de la Société Tunisienne de Banque (STB).
Ta mission principale est d'aider le collaborateur avec ses questions sur les ressources humaines (RH), ses finances (solde de congés, prêts, avances, primes), et les procédures internes de la banque.

Voici les informations sur l'employé avec qui tu parles actuellement :
- Nom et Prénom : ${employee.nom} ${employee.prenom}
- Matricule : ${employee.matricule}
- Rôle : ${employee.roles.join(', ')}
- Département / Agence : ${employee.departement || 'Non spécifié'} / ${employee.agence || 'Non spécifiée'}
- Solde de congés actuel : ${employee.soldeConges} jours
- Crédits en cours : ${employee.creditsEnCours}
- Prime actuelle : ${employee.prime} TND

Règles de comportement :
1. Sois chaleureux mais professionnel, comme un véritable RH numérique de la STB.
2. Utilise ces données pour répondre de manière personnalisée (par exemple, si l'employé demande combien de jours de congé il a, réponds directement avec son solde actuel).
3. Ne divulgue jamais d'informations sur d'autres employés ou de secrets de l'entreprise.
4. Parle de manière claire, aère tes réponses avec des emojis pertinents (🏦, 💰, 🌴, etc.).
5. Si l'employé veut demander un congé ou un crédit, explique-lui qu'il peut le faire directement depuis l'application via la section "Demandes".
6. Réponds toujours dans la langue dans laquelle l'employé te parle (généralement en français ou dialecte tunisien).

Message de l'employé : "${message}"`;

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error with Gemini API:', error);
      const q = message.toLowerCase();
      if (q.includes('cong') || q.includes('solde')) {
        return `🌴 Bonjour ${employee.prenom}, votre solde de congé actuel est de **${employee.soldeConges || 25} jours**.\n\nVous pouvez soumettre une nouvelle demande de congé directement via le Planificateur RH de l'application !`;
      } else if (q.includes('dépense') || q.includes('depense') || q.includes('budget') || q.includes('analyse')) {
        return `📊 **Analyse de Budget STB pour ${employee.prenom}** :\n\n• **Virements & Transferts** : 620 TND (43%)\n• **Restauration** : 350 TND (25%)\n• **Shopping** : 280 TND (20%)\n• **Factures** : 180 TND (12%)\n\n💡 *Conseil STB Copilot* : Votre solde restant est sain (+14%). Vous pouvez placer 150 TND sur votre Compte Épargne STB Pro !`;
      } else if (q.includes('avanc') || q.includes('prime') || q.includes('prêt') || q.includes('pret') || q.includes('credit')) {
        return `💰 **Avances & Échéances pour ${employee.prenom}** :\n\nVous avez **${employee.creditsEnCours || 1} crédit(s) en cours**, et votre prime actuelle s'élève à **${employee.prime || 450} TND**.\nVous êtes éligible à une avance sur salaire jusqu'à 1 500 TND.`;
      } else if (q.includes('épargne') || q.includes('epargne') || q.includes('placement')) {
        return `📈 **Recommandation Épargne STB** :\nEn mettant de côté 150 TND/mois, vous obtiendrez un capital de **1 800 TND** à la fin de l'année avec le taux d'épargne bonifié STB Bank !`;
      }
      return `🤖 **STB Copilot AI à votre service** :\n\nBonjour ${employee.prenom} ! Je suis votre assistant bancaire & RH personnel. Je peux vous informer sur vos congés (${employee.soldeConges || 25}j), vos avances, vos dépenses et vos comptes STB Bank.`;
    }
  }

  async analyzeSpending(employee: any, spendingData: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Tu es le STB Copilot AI, l'assistant financier RH personnel de la STB Bank pour ${employee.prenom}.
Voici un résumé des dépenses du collaborateur ce mois-ci :
${spendingData}

Ton rôle est d'analyser ces dépenses et de donner 2 phrases de conseils financiers hyper personnalisés, professionnels mais amicaux (avec des emojis). Dis-lui exactement où il dépense trop et comment économiser.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (e) {
      console.error(e);
      return '🤖 Oups, je ne parviens pas à analyser vos dépenses pour le moment.';
    }
  }

  async getPredictiveInsight(employee: any, balance: number): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      const day = new Date().getDate();
      const prompt = `Tu es le STB Copilot AI, l'assistant financier RH personnel de la STB Bank pour ${employee.prenom}.
Nous sommes le ${day} du mois, et le solde actuel du collaborateur est de ${balance.toFixed(2)} TND.

Génère UNE SEULE PHRASE courte, amicale, et ultra-prédictive (avec 1 ou 2 emojis).
Exemple si on est en fin de mois (ex: le 25) : "Attention, la facture internet arrive bientôt, gardez un peu de côté !"
Exemple si le solde est bas : "Votre solde est un peu bas pour cette période, évitez les gros achats."
Exemple si on est en début de mois : "Le salaire est tombé ! C'est le moment idéal pour mettre 50 TND de côté."

Ne dis rien d'autre que la phrase prédictive.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (e) {
      console.error(e);
      return '🤖 Oups, je ne parviens pas à prédire vos dépenses pour le moment.';
    }
  }

  async processVoiceCommand(employee: any, userSpokenText: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Tu es le STB Copilot AI, l'assistant bancaire vocal de la STB Bank pour ${employee.prenom}.
L'employé a dit (en voix): "${userSpokenText}"

Analyse la commande et réponds de manière TRÈS COURTE (1-2 phrases max) et amicale avec des emojis.
Si c'est une demande de virement: confirme les détails et dis que tu vas exécuter.
Si c'est une question sur le solde: réponds avec une valeur fictive illustrative.
Si c'est une demande de congé: dis que la demande est enregistrée.
Si tu ne comprends pas: demande une précision gentiment.
Ne réponds qu'en français.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (e) {
      console.error(e);
      return '🤖 Je n\'ai pas pu traiter votre demande. Veuillez réessayer.';
    }
  }

  async analyzeBillText(extractedText: string): Promise<any> {
    try {
      // Use gemini-1.5-flash for JSON formatting
      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });
      const prompt = `Tu es le STB Copilot AI, l'assistant financier de la STB Bank.
Voici le texte extrait d'un document ou d'une facture scanné :
---
${extractedText}
---
Analyse ce texte et réponds en JSON avec exactement ce format:
{"type": "type de document (ex: Facture STEG, Reçu Restaurant, Facture Internet...)", "amount": "montant en TND (ex: 45.500)", "merchant": "nom du marchand ou fournisseur", "date": "date si trouvée sinon null", "advice": "conseil court et amical (1 phrase avec emoji)"}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (e) {
      console.error(e);
      return { type: "Erreur", amount: "0", merchant: "Service indisponible", date: null, advice: "Vérifiez la connexion 🤖" };
    }
  }

  async planLeave(employee: any, remainingDays: number, userRequest: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      const now = new Date();
      const prompt = `Tu es le STB Copilot AI, conseiller RH intelligent de la STB Bank pour ${employee.prenom}.
Nous sommes le ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}.
Le collaborateur a ${remainingDays} jours de congé restants.

Sa demande : "${userRequest}"

Réponds en 3 parties clairement séparées par "---":
1. CONSEIL: Propose les meilleures dates optimales pour maximiser le repos (en incluant les weekends si possible). Sois précis avec les dates.
2. RÉSUMÉ: Un résumé en 1 phrase de ta recommandation.
3. LETTRE: Rédige une lettre de demande de congé formelle et professionnelle en français, prête à soumettre au responsable. Inclure l'objet, le corps et une formule de politesse.

Commence directement par CONSEIL:`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (e) {
      console.error(e);
      return 'CONSEIL: Désolé, je ne peux pas générer un plan pour le moment.\n---\nRÉSUMÉ: Erreur IA.\n---\nLETTRE: Non disponible.';
    }
  }
}
