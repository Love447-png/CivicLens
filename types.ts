import React from 'react';

export enum Severity {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
  NONE = 'None'
}

export interface AnalysisResult {
  issue_type: string;
  severity: Severity;
  confidence: number;
  recommended_action: string;
  description: string;
}

export interface Ticket {
  id: string;
  imageUrl: string; // Base64 or URL
  issue_type: string;
  severity: Severity;
  status: 'Open' | 'In Progress' | 'Resolved';
  timestamp: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export interface GeocodeResult {
  address: string;
  mapLink?: string;
  sourceUri?: string;
}

export interface SearchResult {
  text: string;
  sources: Array<{
    uri: string;
    title: string;
  }>;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}