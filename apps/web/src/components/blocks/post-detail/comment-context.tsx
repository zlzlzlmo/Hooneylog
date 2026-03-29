'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface CommentConfig {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  theme?: string;
  lang?: string;
}

const CommentContext = createContext<CommentConfig | undefined>(undefined);

export function CommentProvider({ 
  children, 
  repo = process.env.NEXT_PUBLIC_GISCUS_REPO || 'zlzlzlmo/Hooneylog',
  repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID || '',
  category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY || 'Comments',
  categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || '',
  theme = 'light',
  lang = 'ko'
}: { 
  children: ReactNode; 
  repo?: string;
  repoId?: string;
  category?: string;
  categoryId?: string;
  theme?: string;
  lang?: string;
}) {
  const value = { repo, repoId, category, categoryId, theme, lang };

  return (
    <CommentContext.Provider value={value}>
      {children}
    </CommentContext.Provider>
  );
}

export function useComment() {
  const context = useContext(CommentContext);
  if (context === undefined) {
    throw new Error('useComment must be used within a CommentProvider');
  }
  return context;
}
