import { useId, type ReactNode } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const fieldClass =
  "w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const id = useId();
  return (
    <label className="block space-y-1 text-sm" htmlFor={id}>
      <span className="text-muted-foreground">{label}</span>
      {multiline ? (
        <textarea
          id={id}
          className={cn(fieldClass, "min-h-24 resize-y")}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          id={id}
          className={fieldClass}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

export function ItemFrame({
  title,
  canUp,
  canDown,
  onUp,
  onDown,
  onRemove,
  children,
}: {
  title: string;
  canUp: boolean;
  canDown: boolean;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{title}</p>
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon-sm" aria-label="上移" disabled={!canUp} onClick={onUp}>
            <ChevronUp />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="下移" disabled={!canDown} onClick={onDown}>
            <ChevronDown />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="删除" onClick={onRemove}>
            <Trash2 />
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}

export function BulletList({
  bullets,
  onChange,
  label = "要点",
}: {
  bullets: string[];
  onChange: (bullets: string[]) => void;
  label?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      {bullets.map((bullet, index) => (
        <div key={index} className="flex gap-2">
          <input
            className={fieldClass}
            value={bullet}
            aria-label={`${label} ${index + 1}`}
            onChange={(event) => {
              const next = [...bullets];
              next[index] = event.target.value;
              onChange(next);
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="删除要点"
            onClick={() => onChange(bullets.filter((_, itemIndex) => itemIndex !== index))}
          >
            <Trash2 />
          </Button>
        </div>
      ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...bullets, ""])}>
        <Plus />
        添加{label}
      </Button>
    </div>
  );
}

export function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  const current = next[index];
  const swap = next[target];
  if (current === undefined || swap === undefined) return items;
  next[index] = swap;
  next[target] = current;
  return next;
}
