import React from 'react';
import Image from 'next/image';
import { ITag } from '@hooneylog/shared-types';
import { formatDate } from '@/utils/date';

interface PostDetailInfoProps {
  title: string;
  createdAt: string;
  tags: ITag[];
}

export function PostDetailInfo({ title, createdAt, tags }: PostDetailInfoProps) {
  return (
    <header className="mb-10 w-full max-w-[720px] mx-auto">
      {/* Notion Page Title */}
      <h1 className="text-[40px] font-bold leading-[1.2] mb-6 text-notion-text tracking-tight break-keep">
        {title}
      </h1>
      
      {/* Properties (like Notion database properties) */}
      <div className="flex flex-col gap-3 py-4 border-y border-notion-border/60">
        
        {/* Author row */}
        <div className="flex items-center text-[14px]">
          <div className="w-[100px] flex-shrink-0 text-notion-secondary flex items-center gap-2">
            <svg viewBox="0 0 14 14" className="w-3.5 h-3.5 fill-current"><path d="M7 7.7a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM12.6 14H1.4C.63 14 0 13.37 0 12.6V11.2C0 9.65 2.1 8.4 7 8.4c4.9 0 7 1.25 7 2.8v1.4c0 .77-.63 1.4-1.4 1.4z"></path></svg>
            Author
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[20px] h-[20px] rounded-full overflow-hidden relative">
              <Image src="/images/profile.png" alt="Seunghoon Shin" fill className="object-cover" />
            </div>
            <span className="text-notion-text underline decoration-notion-border underline-offset-4">Seunghoon Shin</span>
          </div>
        </div>

        {/* Date row */}
        <div className="flex items-center text-[14px]">
          <div className="w-[100px] flex-shrink-0 text-notion-secondary flex items-center gap-2">
            <svg viewBox="0 0 14 14" className="w-3.5 h-3.5 fill-current"><path d="M12.6 1.4h-1.4V0H9.8v1.4H4.2V0H2.8v1.4H1.4C.63 1.4 0 2.03 0 2.8v9.8C0 13.37.63 14 1.4 14h11.2c.77 0 1.4-.63 1.4-1.4V2.8c0-.77-.63-1.4-1.4-1.4zm0 11.2H1.4V5.6h11.2v7z"></path></svg>
            Date
          </div>
          <div className="text-notion-text font-mono text-[13px]">
            {formatDate(createdAt)}
          </div>
        </div>

        {/* Tags row */}
        {tags.length > 0 && (
          <div className="flex items-start text-[14px]">
            <div className="w-[100px] flex-shrink-0 text-notion-secondary flex items-center gap-2 mt-1">
              <svg viewBox="0 0 14 14" className="w-3.5 h-3.5 fill-current"><path d="M6.3 0H1.4C.63 0 0 .63 0 1.4v4.9c0 .37.15.72.41.99l6.3 6.3c.55.55 1.43.55 1.98 0l4.9-4.9c.55-.55.55-1.43 0-1.98l-6.3-6.3A1.4 1.4 0 0 0 6.3 0zm-2.8 4.2a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8z"></path></svg>
              Tags
            </div>
            <div className="flex flex-wrap gap-1.5 flex-1">
              {tags.map((tag) => (
                <span 
                  key={tag.id} 
                  className="px-2 py-0.5 bg-notion-gray-bg text-notion-text rounded-[3px] text-[13px]"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
