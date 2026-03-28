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
    <header className="mb-12">
      <h1 className="text-[3.5rem] font-bold mb-6 break-keep">{title}</h1>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="w-[4rem] h-[4rem] rounded-full overflow-hidden relative border border-gray-200">
          <Image 
            src="/images/profile.png" 
            alt="프로필 이미지" 
            fill
            className="object-cover"
          />
        </div>
        <span className="text-[1.8rem] font-medium text-gray-700">Seunghoon Shin</span>
      </div>
      
      <div className="text-[1.6rem] text-gray-500 mb-6">
        {formatDate(createdAt)}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span 
            key={tag.id} 
            className="px-4 py-2 bg-gray-100 text-sub rounded-full text-sm font-medium"
          >
            #{tag.name}
          </span>
        ))}
      </div>
    </header>
  );
}
