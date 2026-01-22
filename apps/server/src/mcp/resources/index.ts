/**
 * MCP Resources - Contextual data providers
 */

import { MCPResource } from '../types.js';
import { db } from '@gem/db';

/**
 * User Resource - Provides user context
 */
export const UserResource: MCPResource = {
  name: 'user_context',
  description: 'Get current user information and preferences',
  get: async (params?: Record<string, any>) => {
    const user = db.query('SELECT * FROM users LIMIT 1');
    return user.length > 0 ? user[0] : null;
  }
};

/**
 * Resume Templates Resource
 */
export const ResumeTemplatesResource: MCPResource = {
  name: 'resume_templates',
  description: 'Get ATS-friendly resume templates and formats',
  get: async (params?: Record<string, any>) => {
    return {
      templates: [
        {
          name: 'ATS-Optimized',
          structure: ['Header', 'Summary', 'Experience', 'Education', 'Skills'],
          format: 'Chronological'
        },
        {
          name: 'Functional',
          structure: ['Header', 'Summary', 'Skills', 'Experience', 'Education'],
          format: 'Skills-based'
        }
      ],
      atsTips: [
        'Use standard section headings',
        'Include keywords from job description',
        'Use simple formatting',
        'Save as PDF'
      ]
    };
  }
};

/**
 * Trip History Resource
 */
export const TripHistoryResource: MCPResource = {
  name: 'trip_history',
  description: 'Get historical trip data for context',
  get: async (params?: Record<string, any>) => {
    // Could query from database if trips were stored
    return {
      popularRoutes: [
        { from: 'Mumbai', to: 'Goa', frequency: 10 },
        { from: 'Delhi', to: 'Manali', frequency: 8 }
      ],
      averageCosts: {
        train: 500,
        flight: 3000,
        hotel: 2000,
        food: 500
      }
    };
  }
};

export const allResources = [
  UserResource,
  ResumeTemplatesResource,
  TripHistoryResource
];

