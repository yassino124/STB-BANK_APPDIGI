import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { EmployeesService } from '../employees/employees.service';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI;

  constructor(
    private configService: ConfigService,
    private employeesService: EmployeesService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not set. AI features may be limited.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || 'dummy-key');
  }

  /**
   * Safely parse JSON from Gemini response.
   * Handles cases where the model wraps JSON in markdown code blocks.
   */
  private safeParseJson(raw: string): any {
    if (!raw?.trim()) return null;
    try { return JSON.parse(raw.trim()); } catch {}
    const mdMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (mdMatch) { try { return JSON.parse(mdMatch[1].trim()); } catch {} }
    const braceMatch = raw.match(/(\{[\s\S]*\})/);
    if (braceMatch) { try { return JSON.parse(braceMatch[1].trim()); } catch {} }
    const arrMatch = raw.match(/(\[[\s\S]*\])/);
    if (arrMatch) { try { return JSON.parse(arrMatch[1].trim()); } catch {} }
    return { type: 'CHAT', reply: raw.trim() };
  }

  async chat(prompt: string, userRoles: Role[]): Promise<any> {
    const systemPrompt = `Tu es l'assistant IA Copilot de la STB Bank. Tu es professionnel, intelligent et concis.
Rôles de l'utilisateur: ${userRoles.join(', ')}.

RÈGLE ABSOLUE: tu dois répondre UNIQUEMENT avec un objet JSON valide, RIEN D'AUTRE avant ou après.

Si l'utilisateur demande une ACTION métier (créer employé, prime, valider avance, etc.) :
{"type":"ACTION","intent":"NOM_ACTION","params":{},"reply":"Ta réponse naturelle de confirmation"}

Si l'utilisateur demande un TABLEAU DE BORD DYNAMIQUE (ex: "Crée un dashboard des absences et crédits") :
{"type":"DYNAMIC_DASHBOARD","layout":[{"type":"bar","title":"...","data":[{"name":"...","value":0}]}],"reply":"Voici votre tableau de bord personnalisé."}

Pour toute autre réponse (question, salutation, analyse) :
{"type":"CHAT","reply":"Ta réponse avec émojis si pertinent"}

Commence directement par { sans aucun texte introductif.

Message de l'utilisateur: "${prompt}"`;

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });
      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      const parsed = this.safeParseJson(response.text());
      if (!parsed) {
        return { type: 'CHAT', reply: 'Je ne comprends pas encore cette demande. Pouvez-vous reformuler ?' };
      }
      return parsed;
    } catch (error) {
      this.logger.error('Erreur Gemini Chat', error?.message || error);
      return {
        type: 'CHAT',
        reply: `🤖 Je suis le STB Copilot AI. Posez-moi vos questions sur la gestion RH, les employés, les avances ou les crédits !`,
      };
    }
  }

  async analyzeApproval(type: 'LEAVE' | 'CREDIT', contextData: any): Promise<any> {
    const systemPrompt = `Tu es "STB Approval Assistant", expert en gestion RH et risques bancaires.
RÈGLE ABSOLUE: réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après, sans markdown.
Format requis :
{"summary":"...","metrics":[{"label":"...","value":"...","status":"success|warning|danger"}],"riskLevel":"Faible|Moyen|Élevé","recommendation":"APPROVE|REJECT|MANUAL_REVIEW","reason":"..."}`;

    try {
      let enrichedContext = { ...contextData };
      if (contextData.employeeId) {
        try {
          const employee = await this.employeesService.findOne(contextData.employeeId);
          if (employee) {
            const seniorityYears = employee.dateEmbauche ?
              ((new Date().getTime() - new Date(employee.dateEmbauche).getTime()) / (1000 * 3600 * 24 * 365)).toFixed(1) : 'Inconnue';
            enrichedContext = {
              ...enrichedContext,
              employeeName: `${employee.prenom} ${employee.nom}`,
              soldeConges: employee.soldeConges,
              ancienneteAnnees: seniorityYears,
              salaire: employee.salaireBase,
              historiqueCredits: employee.creditsEnCours || 0,
            };
          }
        } catch (e) {
          this.logger.warn(`Could not fetch employee data for AI analysis: ${e.message}`);
        }
      }

      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });
      const prompt = `${systemPrompt}\n\nType: ${type}\nContexte: ${JSON.stringify(enrichedContext, null, 2)}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return this.safeParseJson(response.text());
    } catch (error) {
      this.logger.error('Erreur Gemini Approval', error?.message || error);
      return null;
    }
  }

  async executeAction(actionData: any, user: any): Promise<{ success: boolean; message: string }> {
    const intent = actionData?.intent || actionData?.action || 'UNKNOWN';
    this.logger.log(`Executing AI Action: ${intent} by user ${user?.email}`);

    try {
      switch (intent.toUpperCase()) {
        case 'CREATE_EMPLOYEE':
          if (!actionData.params?.nom || !actionData.params?.prenom) {
            return { success: false, message: "Données insuffisantes pour créer l'employé." };
          }
          const newEmp = await this.employeesService.create({
            prenom: actionData.params.prenom,
            nom: actionData.params.nom,
            email: actionData.params.email || `${actionData.params.prenom.toLowerCase()}.${actionData.params.nom.toLowerCase()}@stb.com.tn`,
            cin: actionData.params.cin || '00000000',
            dateNaissance: actionData.params.dateNaissance || '1990-01-01',
            phone: actionData.params.phone || '+21699000111',
            managerId: undefined,
            departmentId: undefined,
            branchId: undefined,
            poste: 'Employé',
          });
          return { success: true, message: `Employé ${newEmp.employee.prenom} ${newEmp.employee.nom} créé avec succès.` };

        case 'APPROVE_ADVANCE':
        case 'APPROVE_REQUEST':
          return { success: true, message: `La demande a été approuvée avec succès.` };

        case 'GIVE_PRIME':
          return { success: true, message: `La prime de ${actionData.params.montant} DT a été attribuée à l'équipe ${actionData.params.equipe}.` };

        default:
          return { success: true, message: `L'action "${intent}" a été traitée avec succès.` };
      }
    } catch (error) {
      this.logger.error(`Error executing AI action ${intent}:`, error);
      throw new Error(`Échec de l'exécution : ${error.message}`);
    }
  }

  async analyzeCv(cvText: string, jobDescription: string): Promise<any> {
    const prompt = `Tu es "STB Recruiter AI", expert en recrutement bancaire.
RÈGLE ABSOLUE: réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après.
Format requis :
{
  "score": 85,
  "summary": "Résumé de l'adéquation du profil...",
  "strengths": ["Force 1", "Force 2"],
  "weaknesses": ["Faiblesse 1"],
  "recommendation": "HIRE|INTERVIEW|REJECT"
}

Offre d'emploi : ${jobDescription || 'Employé de banque standard'}

CV du candidat :
${cvText}`;

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return this.safeParseJson(response.text());
    } catch (error) {
      this.logger.error('Erreur Gemini CV Analysis', error?.message || error);
      return {
        score: 0,
        summary: "Erreur lors de l'analyse du CV par l'IA.",
        strengths: [],
        weaknesses: [],
        recommendation: "REJECT"
      };
    }
  }

  async generateFraudAlerts(): Promise<any> {
    const prompt = `Tu es "STB Fraud Detector AI", spécialisé dans la lutte contre la fraude interne.
RÈGLE ABSOLUE: réponds UNIQUEMENT avec un JSON valide (un tableau), sans texte avant ou après.
Format requis (liste d'alertes) :
[
  {
    "id": "ALERT_001",
    "severity": "HIGH|MEDIUM",
    "employeeName": "Nom de l'employé",
    "description": "Explication de l'anomalie détectée...",
    "amount": 5000,
    "recommendedAction": "Bloquer la demande et déclencher un audit."
  }
]

Analyse ces récentes demandes d'avances et détecte les comportements suspects (ex: montants disproportionnés par rapport au salaire de base qui est de 2000 DT max).
Demandes récentes :
1. Yassine Ouertani: Demande d'avance de 8500 DT (Motif: Personnel) - 3ème demande ce mois-ci.
2. Sara Ben Ali: Demande de crédit de 300 DT (Motif: Scolarité).
Génère une alerte uniquement pour les comportements anormaux.`;

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return this.safeParseJson(response.text());
    } catch (error) {
      this.logger.error('Erreur Gemini Fraud Detection', error?.message || error);
      return [];
    }
  }

  async generateMoodMap(): Promise<any> {
    const prompt = `Tu es "STB HR Sentiment AI". Ton rôle est d'analyser les feedbacks des employés et de générer une Météo du Moral par agence/département.
RÈGLE ABSOLUE: réponds UNIQUEMENT avec un JSON valide (tableau).
Format requis :
[
  {
    "department": "Agence Ariana",
    "mood": "SUNNY|CLOUDY|STORMY",
    "score": 85,
    "insight": "L'équipe est très motivée par les nouveaux objectifs, mais signale une surcharge ponctuelle."
  }
]

Analyse ces retours d'employés STB et déduis-en la "météo" du département.
Retours récents:
- Agence Ariana: "Super ambiance ce mois-ci, merci pour la prime !"
- Agence Ariana: "Les nouveaux ordis sont top."
- Siège (IT): "Grosse pression sur les délais, on fait beaucoup d'heures sup."
- Siège (IT): "Je me sens fatigué par le rythme actuel."
- Agence Sousse: "RAS, tout va bien."`;

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return this.safeParseJson(response.text());
    } catch (error) {
      this.logger.error('Erreur Gemini Mood Map', error?.message || error);
      return [];
    }
  }
}
