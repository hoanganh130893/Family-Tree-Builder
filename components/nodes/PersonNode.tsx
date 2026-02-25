import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FamilyNode } from '@/store/useFamilyStore';
import { User, UserRound } from 'lucide-react';

const PersonNode = ({ data, selected }: NodeProps<FamilyNode>) => {
  if (data.type !== 'person') return null;
  const { firstName, lastName, birthDate, deathDate, avatarUrl, gender } = data;

  const bgColor = selected 
    ? 'border-blue-500 shadow-lg' 
    : 'border-slate-200 shadow-sm hover:border-slate-300';
    
  const genderColor = gender === 'male' 
    ? 'bg-blue-50 text-blue-700' 
    : gender === 'female' 
      ? 'bg-pink-50 text-pink-700' 
      : 'bg-slate-50 text-slate-700';

  return (
    <div className={`relative w-48 rounded-xl border-2 bg-white transition-all ${bgColor}`}>
      <Handle
        type="target"
        position={Position.Top}
        id="parent"
        className="w-3 h-3 bg-emerald-400 border-2 border-white"
      />

      <div className="p-3 flex flex-col items-center text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 overflow-hidden border-2 border-white shadow-sm ${genderColor}`}>
          {avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={avatarUrl} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" />
          ) : (
            <UserRound className="w-8 h-8 opacity-50" />
          )}
        </div>
        
        <div className="font-semibold text-slate-900 text-sm truncate w-full">
          {firstName} {lastName}
        </div>
        
        {(birthDate || deathDate) && (
          <div className="text-xs text-slate-500 mt-1 font-mono">
            {birthDate ? new Date(birthDate).getFullYear() : '?'} - {deathDate ? new Date(deathDate).getFullYear() : (deathDate === null ? '?' : '')}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Left}
        id="spouse-left"
        className="w-3 h-3 bg-indigo-400 border-2 border-white top-1/2 -translate-y-1/2"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="spouse-right"
        className="w-3 h-3 bg-indigo-400 border-2 border-white top-1/2 -translate-y-1/2"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="spouse"
        className="w-3 h-3 bg-indigo-400 border-2 border-white"
      />
    </div>
  );
};

export default memo(PersonNode);
