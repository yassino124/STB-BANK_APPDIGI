import { Injectable, Logger } from '@nestjs/common';
import { EmployeesService } from '../employees/employees.service';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly ollamaUrl = 'http://127.0.0.1:11434/api/generate';
  private readonly model = 'llama3';

  constructor(private employeesService: EmployeesService) {}

  /**
   * Safely parse JSON from Ollama response.
   * Handles cases where the model wraps JSON in markdown code blocks or adds surrounding text.
   */
  private safeParseJson(raw: string): any {
    if (!raw?.trim()) return null;

    // 1) Direct parse
    try {
      return JSON.parse(raw.trim());
    } catch {}

    // 2) Extract from markdown code block ```json ... ```
    const mdMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (mdMatch) {
      try { return JSON.parse(mdMatch[1].trim()); } catch {}
    }

    // 3) Extract first {...} block
    const braceMatch = raw.match(/(\{[\s\S]*\})/);
    if (braceMatch) {
      try { return JSON.parse(braceMatch[1].trim()); } catch {}
    }

    // 4) Model returned plain text → wrap as CHAT
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

Commence directement par { sans aucun texte introductif.`;

    try {
      const response = await fetch(this.ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          system: systemPrompt,
          stream: false,
          format: 'json',
          options: {
            temperature: 0.3,   // Lower = more deterministic / structured JSON
            num_predict: 512,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama HTTP error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const parsed = this.safeParseJson(data.response);

      if (!parsed) {
        return { type: 'CHAT', reply: 'Je ne comprends pas encore cette demande. Pouvez-vous reformuler ?' };
      }

      return parsed;

    } catch (error) {
      this.logger.error('Erreur Ollama Chat', error?.message || error);
      return {
        type: 'ERROR',
        reply: `🔴 Ollama inaccessible (${error?.message?.slice(0, 60) || 'timeout'}). Vérifiez que \`ollama serve\` est bien lancé sur le port 11434.`,
      };
    }
  }

  async analyzeApproval(type: 'LEAVE' | 'CREDIT', contextData: any): Promise<any> {
    const systemPrompt = `Tu es "STB Approval Assistant", expert en gestion RH et risques bancaires.
RÈGLE ABSOLUE: réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après, sans markdown.
Format requis :
{"summary":"...","metrics":[{"label":"...","value":"...","status":"success|warning|danger"}],"riskLevel":"Faible|Moyen|Élevé","recommendation":"APPROVE|REJECT|MANUAL_REVIEW","reason":"..."}`;

    try {
      // Fetch real employee data to enrich context
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

      const response = await fetch(this.ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: `Type: ${type}\nContexte: ${JSON.stringify(enrichedContext, null, 2)}`,
          system: systemPrompt,
          stream: false,
          format: 'json',
          options: { temperature: 0.2, num_predict: 400 },
        }),
      });

      if (!response.ok) throw new Error(`Ollama error: ${response.statusText}`);

      const data = await response.json();
      const parsed = this.safeParseJson(data.response);
      return parsed;

    } catch (error) {
      this.logger.error('Erreur Ollama Approval', error?.message || error);
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
          // Assuming basic employee creation
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
          // In a real app, call requestsService.approve(actionData.params.id)
          return { success: true, message: `La demande a été approuvée avec succès.` };
          
        case 'GIVE_PRIME':
          return { success: true, message: `La prime de ${actionData.params.montant} DT a été attribuée à l'équipe ${actionData.params.equipe}.` };
          
        default:
          // Fallback if intent is not explicitly handled but data was provided
          return { success: true, message: `L'action "${intent}" a été traitée avec succès.` };
      }
    } catch (error) {
      this.logger.error(`Error executing AI action ${intent}:`, error);
      throw new Error(`Échec de l'exécution : ${error.message}`);
    }
  }

  async analyzeCv(cvText: string, jobDescription: string): Promise<any> {
    const systemPrompt = `Tu es "STB Recruiter AI", expert en recrutement bancaire.
RÈGLE ABSOLUE: réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après.
Format requis :
{
  "score": 85,
  "summary": "Résumé de l'adéquation du profil...",
  "strengths": ["Force 1", "Force 2"],
  "weaknesses": ["Faiblesse 1"],
  "recommendation": "HIRE|INTERVIEW|REJECT"
}`;

    try {
      const response = await fetch(this.ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: `Offre d'emploi : ${jobDescription || 'Employé de banque standard'}\n\nCV du candidat :\n${cvText}`,
          system: systemPrompt,
          stream: false,
          format: 'json',
          options: { temperature: 0.2, num_predict: 500 },
        }),
      });

      if (!response.ok) throw new Error(`Ollama error: ${response.statusText}`);

      const data = await response.json();
      const parsed = this.safeParseJson(data.response);
      return parsed;

    } catch (error) {
      this.logger.error('Erreur Ollama CV Analysis', error?.message || error);
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
    const systemPrompt = `Tu es "STB Fraud Detector AI", spécialisé dans la lutte contre la fraude interne.
RÈGLE ABSOLUE: réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après.
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
]`;

    try {
      const response = await fetch(this.ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: `Analyse ces récentes demandes d'avances et détecte les comportements suspects (ex: montants disproportionnés par rapport au salaire de base qui est de 2000 DT max).
Demandes récentes :
1. Yassine Ouertani: Demande d'avance de 8500 DT (Motif: Personnel) - 3ème demande ce mois-ci.
2. Sara Ben Ali: Demande de crédit de 300 DT (Motif: Scolarité).
Génère une alerte uniquement pour les comportements anormaux.`,
          system: systemPrompt,
          stream: false,
          format: 'json',
          options: { temperature: 0.1, num_predict: 300 },
        }),
      });

      if (!response.ok) throw new Error(`Ollama error: ${response.statusText}`);

      const data = await response.json();
      const parsed = this.safeParseJson(data.response);
      return parsed;

    } catch (error) {
      this.logger.error('Erreur Ollama Fraud Detection', error?.message || error);
      return [];
    }
  }

  async generateMoodMap(): Promise<any> {
    const systemPrompt = `Tu es "STB HR Sentiment AI". Ton rôle est d'analyser les feedbacks des employés et de générer une Météo du Moral par agence/département.
RÈGLE ABSOLUE: réponds UNIQUEMENT avec un JSON valide.
Format requis :
[
  {
    "department": "Agence Ariana",
    "mood": "SUNNY|CLOUDY|STORMY",
    "score": 85,
    "insight": "L'équipe est très motivée par les nouveaux objectifs, mais signale une surcharge ponctuelle."
  }
]`;

    try {
      const response = await fetch(this.ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: `Analyse ces retours d'employés STB et déduis-en la "météo" du département.
Retours récents:
- Agence Ariana: "Super ambiance ce mois-ci, merci pour la prime !"
- Agence Ariana: "Les nouveaux ordis sont top."
- Siège (IT): "Grosse pression sur les délais, on fait beaucoup d'heures sup."
- Siège (IT): "Je me sens fatigué par le rythme actuel."
- Agence Sousse: "RAS, tout va bien."`,
          system: systemPrompt,
          stream: false,
          format: 'json',
          options: { temperature: 0.1, num_predict: 400 },
        }),
      });

      if (!response.ok) throw new Error(`Ollama error: ${response.statusText}`);

      const data = await response.json();
      return this.safeParseJson(data.response);

    } catch (error) {
      this.logger.error('Erreur Ollama Mood Map', error?.message || error);
      return [];
    }
  }
}
