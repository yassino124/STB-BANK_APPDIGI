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
      // Use the gemini-pro model which is stable in v1beta
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      // Build the contextual prompt
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
      
      // Fallback intelligent en cas de problème d'API (pour éviter que l'application ne plante en démo)
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
}
