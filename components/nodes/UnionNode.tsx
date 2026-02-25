import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FamilyNode } from '@/store/useFamilyStore';
import { Heart, Users, User } from 'lucide-react';

const UnionNode = ({ data, selected }: NodeProps<FamilyNode>) => {
  if (data.type !== 'union') return null;
  const { unionType, startDate, endDate } = data;

  const bgColor = selected 
    ? 'border-indigo-500 shadow-md' 
    : 'border-indigo-200 shadow-sm hover:border-indigo-300';

  const icon = unionType === 'marriage' 
    ? <Heart className="w-4 h-4 text-pink-500" />
    : unionType === 'partnership'
      ? <Users className="w-4 h-4 text-indigo-500" />
      : <User className="w-4 h-4 text-slate-500" />;

  return (
    <div className={`relative w-12 h-12 rounded-full border-2 bg-white flex items-center justify-center transition-all ${bgColor}`}>
      <Handle
        type="target"
        position={Position.Left}
        id="spouse-left"
        className="w-2 h-2 bg-indigo-400 border-2 border-white"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="spouse-right"
        className="w-2 h-2 bg-indigo-400 border-2 border-white"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="spouse-top"
        className="w-2 h-2 bg-indigo-400 border-2 border-white"
      />

      {icon}

      <Handle
        type="source"
        position={Position.Bottom}
        id="child"
        className="w-3 h-3 bg-emerald-400 border-2 border-white"
      />
    </div>
  );
};

export default memo(UnionNode);
