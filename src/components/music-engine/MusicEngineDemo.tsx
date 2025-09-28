/**
 * Music Engine Demo Component
 * 
 * Simple demo showing how to integrate the music engine
 */

'use client';

import React from 'react';
import { MusicEngine } from './MusicEngine';

export function MusicEngineDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <MusicEngine />
      </div>
    </div>
  );
}
