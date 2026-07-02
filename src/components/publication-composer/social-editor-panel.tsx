'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n';
import { FacebookIcon } from '@/components/social/facebook-icon';
import { FACEBOOK_CHAR_LIMIT } from '@/lib/publication-composer';
import { ComposerContentEditor } from './composer-content-editor';

interface SocialEditorPanelProps {
  text: string;
  onTextChange: (value: string) => void;
}

export function SocialEditorPanel({
  text,
  onTextChange,
}: SocialEditorPanelProps) {
  const { t } = useTranslation();
  const pc = t.publicationComposer;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-[#E8ECEF] bg-[#F5F7F9] px-2 py-1.5">
          <FacebookIcon className="h-4 w-4 text-[#1877F2]" />
          <Select defaultValue="publication">
            <SelectTrigger className="h-7 w-auto min-w-[120px] border-0 bg-transparent px-1 text-xs font-semibold uppercase tracking-wide shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="publication">{pc.publication}</SelectItem>
              <SelectItem value="story">{pc.story}</SelectItem>
              <SelectItem value="reel">{pc.reel}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0 border-[#E8ECEF] bg-white"
          title={pc.addPlatform}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ComposerContentEditor
        value={text}
        onChange={onTextChange}
        placeholder={pc.placeholderSocial}
        charLimit={FACEBOOK_CHAR_LIMIT}
        counterIcon={<FacebookIcon className="h-3.5 w-3.5 text-[#1877F2]" />}
      />
    </div>
  );
}
