import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { FilterIcon, SearchIcon, SortAsc } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Filter } from './Tools/Filter';
import { Sort } from './Tools/Sort';

function BoardTools() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('');

  return (
    <div className="flex items-center p-4 bg-white shadow-md space-x-4">
      {/* Search */}
      <div className="flex items-center space-x-2">
        <SearchIcon className="w-5 h-5 text-gray-500" />
        <Input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs"
        />
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-2">
        <FilterIcon className="w-5 h-5 text-gray-500" />
        <Filter />
      </div>

      {/* Sort */}
      <div className="flex items-center space-x-2 ml-auto">
        <SortAsc className="w-5 h-5 text-gray-500" />
        <Sort />
      </div>
    </div>
  );
}

export default BoardTools;
