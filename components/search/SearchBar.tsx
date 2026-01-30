'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    resultCount: number;
}

export default function SearchBar({ value, onChange, resultCount }: SearchBarProps) {
    return (
        <div className="absolute top-4 left-4 z-20 bg-white rounded-lg shadow-lg p-4 w-96">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    type="text"
                    placeholder="Search by name, city, or state..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="pl-10 pr-10"
                />
                {value && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                        onClick={() => onChange('')}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
            {value && (
                <p className="text-sm text-gray-500 mt-2">
                    {resultCount} result{resultCount !== 1 ? 's' : ''}
                </p>
            )}
        </div>
    );
}
