"use client";

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
}

function insertAroundSelection(
  textarea: HTMLTextAreaElement,
  prefix: string,
  suffix: string,
  placeholder: string,
  onChange: (value: string) => void,
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;

  const selected = text.substring(start, end);
  const hasSelection = start !== end;

  const before = text.substring(0, start);
  const after = text.substring(end);

  if (hasSelection) {
    const newText = before + prefix + selected + suffix + after;
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  } else {
    const newText = before + prefix + placeholder + suffix + after;
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + placeholder.length,
      );
    }, 0);
  }
}

function insertAtStartOfLine(
  textarea: HTMLTextAreaElement,
  prefix: string,
  placeholder: string,
  onChange: (value: string) => void,
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;

  const lineStart = text.lastIndexOf("\n", start - 1) + 1;
  const selected = text.substring(start, end) || placeholder;

  const before = text.substring(0, lineStart);
  const after = text.substring(end || start);

  const newText = before + prefix + selected + (after.startsWith("\n") ? "" : "\n") + after;
  onChange(newText);
  setTimeout(() => {
    textarea.focus();
  }, 0);
}

export default function MarkdownToolbar({
  textareaRef,
  onChange,
}: MarkdownToolbarProps) {
  const handleBold = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    insertAroundSelection(textarea, "**", "**", "texto", onChange);
  };

  const handleItalic = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    insertAroundSelection(textarea, "_", "_", "texto", onChange);
  };

  const handleList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    insertAtStartOfLine(textarea, "- ", "item", onChange);
  };

  const btnCls =
    "flex h-8 w-8 items-center justify-center rounded-md text-[13px] font-bold text-[#6E6359] hover:bg-[#ECE0D0] transition-colors";

  return (
    <div className="mb-1.5 flex items-center gap-1">
      <button type="button" className={btnCls} onClick={handleBold} title="Negrita">
        <span className="font-bold">N</span>
      </button>
      <button type="button" className={btnCls} onClick={handleItalic} title="Cursiva">
        <span className="italic">C</span>
      </button>
      <button type="button" className={btnCls} onClick={handleList} title="Lista">
        <span>≡</span>
      </button>
    </div>
  );
}
