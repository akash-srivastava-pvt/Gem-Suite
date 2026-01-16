/**
 * Agent Registration - Register all agents
 */

import { agentRegistry } from '../orchestration/agentRegistry.js';

// Trip Planner Agents
import { RouteAgent } from './trip/routeAgent.js';
import { CostAgent } from './trip/costAgent.js';
import { WeatherAgent } from './trip/weatherAgent.js';
import { LocalizationAgent } from './trip/localizationAgent.js';

// Resume Maker Agents
import { ResumeAgent } from './resume/resumeAgent.js';
import { GrammarAgent } from './resume/grammarAgent.js';
import { ATSScoringAgent } from './resume/atsScoringAgent.js';
import { FormattingAgent } from './resume/formattingAgent.js';

// Text Editor Agents
import { TextEditorAgent } from './text/textEditorAgent.js';
import { TextGrammarAgent } from './text/grammarAgent.js';
import { StyleAgent } from './text/styleAgent.js';
import { ToneAgent } from './text/toneAgent.js';

// Invitation Maker Agents
import { DesignAgent } from './invitation/designAgent.js';
import { InvitationLocalizationAgent } from './invitation/localizationAgent.js';
import { QualityAgent } from './invitation/qualityAgent.js';

/**
 * Register all agents
 */
export function registerAllAgents() {
  // Trip Planner Agents
  agentRegistry.register(RouteAgent);
  agentRegistry.register(CostAgent);
  agentRegistry.register(WeatherAgent);
  agentRegistry.register(LocalizationAgent);

  // Resume Maker Agents
  agentRegistry.register(ResumeAgent);
  agentRegistry.register(GrammarAgent);
  agentRegistry.register(ATSScoringAgent);
  agentRegistry.register(FormattingAgent);

  // Text Editor Agents
  agentRegistry.register(TextEditorAgent);
  agentRegistry.register(TextGrammarAgent);
  agentRegistry.register(StyleAgent);
  agentRegistry.register(ToneAgent);

  // Invitation Maker Agents
  agentRegistry.register(DesignAgent);
  agentRegistry.register(InvitationLocalizationAgent);
  agentRegistry.register(QualityAgent);
}

// Export all agents for easy access
export {
  // Trip Planner
  RouteAgent,
  CostAgent,
  WeatherAgent,
  LocalizationAgent,
  
  // Resume Maker
  ResumeAgent,
  GrammarAgent,
  ATSScoringAgent,
  FormattingAgent,
  
  // Text Editor
  TextEditorAgent,
  TextGrammarAgent,
  StyleAgent,
  ToneAgent,
  
  // Invitation Maker
  DesignAgent,
  InvitationLocalizationAgent,
  QualityAgent
};

